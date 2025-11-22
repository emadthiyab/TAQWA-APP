const mongoose = require('mongoose');

const evaluationCriteriaSchema = new mongoose.Schema({
    name: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    description: {
        ar: String,
        en: String
    },
    category: {
        type: String,
        enum: ['quality', 'productivity', 'problem_solving', 'customer_service', 'management', 'leadership', 'hr', 'gm'],
        required: true
    },
    categoryName: {
        ar: String,
        en: String
    },
    subCriteria: [{
        name: {
            ar: String,
            en: String
        },
        description: {
            ar: String,
            en: String
        },
        weight: {
            type: Number,
            default: 0
        }
    }],
    maxScore: {
        type: Number,
        default: 5
    },
    weight: {
        type: Number,
        default: 0
    },
    performanceLevels: [{
        level: {
            type: Number,
            required: true
        },
        name: {
            ar: String,
            en: String
        },
        description: {
            ar: String,
            en: String
        },
        minScore: Number,
        maxScore: Number
    }],
    section: {
        type: String,
        enum: ['hod', 'hr', 'gm'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// فهرس للبحث السريع
evaluationCriteriaSchema.index({ category: 1, section: 1, isActive: 1 });

module.exports = mongoose.model('EvaluationCriteria', evaluationCriteriaSchema);