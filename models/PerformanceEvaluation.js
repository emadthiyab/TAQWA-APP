const mongoose = require('mongoose');

const performanceEvaluationSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    evaluationPeriod: {
        type: String,
        required: true // مثال: "2024-Q1", "2024-Annual"
    },
    evaluationDate: {
        type: Date,
        default: Date.now
    },
    position: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    
    // المعلومات التنفيذية
    executiveInfo: {
        executiveName: String,
        performanceReviewDate: Date,
        lastPerformanceReviewDate: Date,
        dateInCurrentPosition: Date,
        dateOfJoiningHotel: Date,
        directSupervisorName: String
    },
    
    // المؤهلات والشهادات الجديدة
    newQualifications: [{
        name: String,
        description: String,
        dateObtained: Date,
        evidence: String // مسار الملف المرفق
    }],
    
    // التقييمات التفصيلية
    evaluations: {
        // تقييم HOD (رئيس القسم)
        hod: {
            ratings: [{
                criteria: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EvaluationCriteria'
                },
                score: Number,
                comments: String,
                obtainedRating: Number,
                maxRating: Number,
                decimalScore: Number
            }],
            totalScore: Number,
            maxScore: Number,
            percentage: Number
        },
        
        // تقييم HR
        hr: {
            ratings: [{
                criteria: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EvaluationCriteria'
                },
                score: Number,
                comments: String,
                obtainedRating: Number,
                maxRating: Number,
                decimalScore: Number
            }],
            totalScore: Number,
            maxScore: Number,
            percentage: Number
        },
        
        // تقييم GM
        gm: {
            ratings: [{
                criteria: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EvaluationCriteria'
                },
                score: Number,
                comments: String,
                obtainedRating: Number,
                maxRating: Number,
                decimalScore: Number
            }],
            totalScore: Number,
            maxScore: Number,
            percentage: Number,
            remarks: String
        }
    },
    
    // التقييم الشامل
    overallRatings: {
        qualityOfWork: {
            score: Number,
            comments: String
        },
        productivity: {
            score: Number,
            comments: String
        },
        problemSolving: {
            score: Number,
            comments: String
        },
        customerService: {
            score: Number,
            comments: String
        },
        management: {
            score: Number,
            comments: String
        },
        leadership: {
            score: Number,
            comments: String
        }
    },
    
    // النتائج النهائية
    finalResults: {
        totalScore: Number,
        maxScore: Number,
        overallPercentage: Number,
        performanceLevel: Number,
        performanceDescription: String,
        overallPerformanceScore: Number
    },
    
    // تعليقات الموظف
    employeeComments: String,
    
    // التواقيع
    signatures: {
        employee: {
            signed: Boolean,
            signedAt: Date,
            signature: String
        },
        generalManager: {
            signed: Boolean,
            signedAt: Date,
            signature: String
        }
    },
    
    status: {
        type: String,
        enum: ['draft', 'in_progress', 'completed', 'approved', 'rejected'],
        default: 'draft'
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// فهارس للبحث السريع
performanceEvaluationSchema.index({ employee: 1, evaluationPeriod: 1 });
performanceEvaluationSchema.index({ evaluator: 1, status: 1 });
performanceEvaluationSchema.index({ department: 1, evaluationPeriod: 1 });

// middleware لحساب النتائج النهائية تلقائياً
performanceEvaluationSchema.pre('save', function(next) {
    this.calculateFinalResults();
    next();
});

// دالة لحساب النتائج النهائية
performanceEvaluationSchema.methods.calculateFinalResults = function() {
    // حساب نتائج HOD
    if (this.evaluations.hod.ratings.length > 0) {
        const hodScores = this.evaluations.hod.ratings.reduce((acc, rating) => {
            acc.obtained += rating.obtainedRating || 0;
            acc.max += rating.maxRating || 0;
            acc.decimal += rating.decimalScore || 0;
            return acc;
        }, { obtained: 0, max: 0, decimal: 0 });
        
        this.evaluations.hod.totalScore = hodScores.obtained;
        this.evaluations.hod.maxScore = hodScores.max;
        this.evaluations.hod.percentage = hodScores.max > 0 ? (hodScores.obtained / hodScores.max) * 100 : 0;
    }
    
    // حساب نتائج HR
    if (this.evaluations.hr.ratings.length > 0) {
        const hrScores = this.evaluations.hr.ratings.reduce((acc, rating) => {
            acc.obtained += rating.obtainedRating || 0;
            acc.max += rating.maxRating || 0;
            acc.decimal += rating.decimalScore || 0;
            return acc;
        }, { obtained: 0, max: 0, decimal: 0 });
        
        this.evaluations.hr.totalScore = hrScores.obtained;
        this.evaluations.hr.maxScore = hrScores.max;
        this.evaluations.hr.percentage = hrScores.max > 0 ? (hrScores.obtained / hrScores.max) * 100 : 0;
    }
    
    // حساب نتائج GM
    if (this.evaluations.gm.ratings.length > 0) {
        const gmScores = this.evaluations.gm.ratings.reduce((acc, rating) => {
            acc.obtained += rating.obtainedRating || 0;
            acc.max += rating.maxRating || 0;
            acc.decimal += rating.decimalScore || 0;
            return acc;
        }, { obtained: 0, max: 0, decimal: 0 });
        
        this.evaluations.gm.totalScore = gmScores.obtained;
        this.evaluations.gm.maxScore = gmScores.max;
        this.evaluations.gm.percentage = gmScores.max > 0 ? (hrScores.obtained / hrScores.max) * 100 : 0;
    }
    
    // حساب النتيجة النهائية
    const totalObtained = (this.evaluations.hod.totalScore || 0) + 
                         (this.evaluations.hr.totalScore || 0) + 
                         (this.evaluations.gm.totalScore || 0);
    
    const totalMax = (this.evaluations.hod.maxScore || 0) + 
                    (this.evaluations.hr.maxScore || 0) + 
                    (this.evaluations.gm.maxScore || 0);
    
    this.finalResults.totalScore = totalObtained;
    this.finalResults.maxScore = totalMax;
    this.finalResults.overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    this.finalResults.overallPerformanceScore = (totalObtained / totalMax) * 10;
    
    // تحديد مستوى الأداء
    this.determinePerformanceLevel();
};

// دالة لتحديد مستوى الأداء
performanceEvaluationSchema.methods.determinePerformanceLevel = function() {
    const score = this.finalResults.overallPerformanceScore;
    
    if (score >= 9) {
        this.finalResults.performanceLevel = 5;
        this.finalResults.performanceDescription = 'Outstanding Performance (Exceptional)';
    } else if (score >= 8) {
        this.finalResults.performanceLevel = 4;
        this.finalResults.performanceDescription = 'Excellent (Exceeds Expectations)';
    } else if (score >= 7) {
        this.finalResults.performanceLevel = 3;
        this.finalResults.performanceDescription = 'Meets Expectations';
    } else if (score >= 5) {
        this.finalResults.performanceLevel = 2;
        this.finalResults.performanceDescription = 'Mix Outcome (Needs improvement)';
    } else {
        this.finalResults.performanceLevel = 1;
        this.finalResults.performanceDescription = 'Does Not Achieve Performance Standards';
    }
};

module.exports = mongoose.model('PerformanceEvaluation', performanceEvaluationSchema);