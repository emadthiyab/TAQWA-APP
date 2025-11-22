const express = require('express');
const EvaluationCriteria = require('../models/EvaluationCriteria');
const PerformanceEvaluation = require('../models/PerformanceEvaluation');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const router = express.Router();

// Middleware للتحقق من الصلاحيات
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login?lang=' + (req.query.lang || 'ar'));
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'مدير') {
        return res.redirect('/login?lang=' + (req.query.lang || 'ar'));
    }
    next();
};

// صفحة إدارة معايير التقييم
router.get('/criteria', requireAdmin, async (req, res) => {
    try {
        const criteria = await EvaluationCriteria.find({ isActive: true })
            .sort({ category: 1, section: 1 })
            .populate('createdBy', 'name');
        
        const categories = [
            { value: 'quality', name: { ar: 'جودة العمل', en: 'Quality of Work' } },
            { value: 'productivity', name: { ar: 'الإنتاجية والإنجاز', en: 'Productivity/Accomplishment' } },
            { value: 'problem_solving', name: { ar: 'حل المشكلات واتخاذ القرارات', en: 'Problem Solving/Decision Making' } },
            { value: 'customer_service', name: { ar: 'خدمة العملاء', en: 'Customer Service/Customer Focus' } },
            { value: 'management', name: { ar: 'الإدارة', en: 'Management' } },
            { value: 'leadership', name: { ar: 'القيادة', en: 'Leadership' } },
            { value: 'hr', name: { ar: 'الموارد البشرية', en: 'Human Resources' } },
            { value: 'gm', name: { ar: 'المدير العام', en: 'General Manager' } }
        ];
        
        const sections = [
            { value: 'hod', name: { ar: 'رئيس القسم', en: 'HOD' } },
            { value: 'hr', name: { ar: 'الموارد البشرية', en: 'HR' } },
            { value: 'gm', name: { ar: 'المدير العام', en: 'GM' } }
        ];

        res.render('admin/evaluation-criteria', {
            title: res.locals.lang === 'ar' ? 'إدارة معايير التقييم' : 'Evaluation Criteria Management',
            user: req.session.user,
            criteria,
            categories,
            sections,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error loading criteria:', error);
        res.status(500).render('error', {
            error: res.locals.lang === 'ar' ? 'خطأ في تحميل معايير التقييم' : 'Error loading evaluation criteria'
        });
    }
});

// إضافة معيار تقييم جديد
router.post('/criteria', requireAdmin, async (req, res) => {
    try {
        const { name_ar, name_en, description_ar, description_en, category, section, maxScore, weight } = req.body;
        
        // معالجة مستويات الأداء
        const performanceLevels = [];
        for (let i = 1; i <= 5; i++) {
            if (req.body[`level_${i}_name_ar`] && req.body[`level_${i}_name_en`]) {
                performanceLevels.push({
                    level: i,
                    name: {
                        ar: req.body[`level_${i}_name_ar`],
                        en: req.body[`level_${i}_name_en`]
                    },
                    description: {
                        ar: req.body[`level_${i}_desc_ar`] || '',
                        en: req.body[`level_${i}_desc_en`] || ''
                    },
                    minScore: parseFloat(req.body[`level_${i}_min`]) || 0,
                    maxScore: parseFloat(req.body[`level_${i}_max`]) || 0
                });
            }
        }
        
        // معالجة المعايير الفرعية
        const subCriteria = [];
        let subIndex = 0;
        while (req.body[`sub_${subIndex}_name_ar`]) {
            subCriteria.push({
                name: {
                    ar: req.body[`sub_${subIndex}_name_ar`],
                    en: req.body[`sub_${subIndex}_name_en`]
                },
                description: {
                    ar: req.body[`sub_${subIndex}_desc_ar`] || '',
                    en: req.body[`sub_${subIndex}_desc_en`] || ''
                },
                weight: parseFloat(req.body[`sub_${subIndex}_weight`]) || 0
            });
            subIndex++;
        }
        
        // تحديد اسم الفئة
        let categoryName = { ar: '', en: '' };
        switch (category) {
            case 'quality':
                categoryName = { ar: 'جودة العمل', en: 'Quality of Work' };
                break;
            case 'productivity':
                categoryName = { ar: 'الإنتاجية والإنجاز', en: 'Productivity/Accomplishment' };
                break;
            case 'problem_solving':
                categoryName = { ar: 'حل المشكلات واتخاذ القرارات', en: 'Problem Solving/Decision Making' };
                break;
            case 'customer_service':
                categoryName = { ar: 'خدمة العملاء', en: 'Customer Service/Customer Focus' };
                break;
            case 'management':
                categoryName = { ar: 'الإدارة', en: 'Management' };
                break;
            case 'leadership':
                categoryName = { ar: 'القيادة', en: 'Leadership' };
                break;
            case 'hr':
                categoryName = { ar: 'الموارد البشرية', en: 'Human Resources' };
                break;
            case 'gm':
                categoryName = { ar: 'المدير العام', en: 'General Manager' };
                break;
        }

        const criteria = new EvaluationCriteria({
            name: {
                ar: name_ar,
                en: name_en
            },
            description: {
                ar: description_ar,
                en: description_en
            },
            category,
            categoryName,
            section,
            maxScore: parseInt(maxScore) || 5,
            weight: parseFloat(weight) || 0,
            performanceLevels,
            subCriteria,
            createdBy: req.session.user.id
        });

        await criteria.save();
        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&success=criteria_created');
    } catch (error) {
        console.error('Error creating criteria:', error);
        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&error=criteria_create_failed');
    }
});

// تحديث معيار التقييم
router.put('/criteria/:id', requireAdmin, async (req, res) => {
    try {
        const { name_ar, name_en, description_ar, description_en, category, section, maxScore, weight } = req.body;
        
        // معالجة مستويات الأداء
        const performanceLevels = [];
        for (let i = 1; i <= 5; i++) {
            if (req.body[`level_${i}_name_ar`] && req.body[`level_${i}_name_en`]) {
                performanceLevels.push({
                    level: i,
                    name: {
                        ar: req.body[`level_${i}_name_ar`],
                        en: req.body[`level_${i}_name_en`]
                    },
                    description: {
                        ar: req.body[`level_${i}_desc_ar`] || '',
                        en: req.body[`level_${i}_desc_en`] || ''
                    },
                    minScore: parseFloat(req.body[`level_${i}_min`]) || 0,
                    maxScore: parseFloat(req.body[`level_${i}_max`]) || 0
                });
            }
        }
        
        // معالجة المعايير الفرعية
        const subCriteria = [];
        let subIndex = 0;
        while (req.body[`sub_${subIndex}_name_ar`]) {
            subCriteria.push({
                name: {
                    ar: req.body[`sub_${subIndex}_name_ar`],
                    en: req.body[`sub_${subIndex}_name_en`]
                },
                description: {
                    ar: req.body[`sub_${subIndex}_desc_ar`] || '',
                    en: req.body[`sub_${subIndex}_desc_en`] || ''
                },
                weight: parseFloat(req.body[`sub_${subIndex}_weight`]) || 0
            });
            subIndex++;
        }
        
        // تحديد اسم الفئة
        let categoryName = { ar: '', en: '' };
        switch (category) {
            case 'quality':
                categoryName = { ar: 'جودة العمل', en: 'Quality of Work' };
                break;
            case 'productivity':
                categoryName = { ar: 'الإنتاجية والإنجاز', en: 'Productivity/Accomplishment' };
                break;
            case 'problem_solving':
                categoryName = { ar: 'حل المشكلات واتخاذ القرارات', en: 'Problem Solving/Decision Making' };
                break;
            case 'customer_service':
                categoryName = { ar: 'خدمة العملاء', en: 'Customer Service/Customer Focus' };
                break;
            case 'management':
                categoryName = { ar: 'الإدارة', en: 'Management' };
                break;
            case 'leadership':
                categoryName = { ar: 'القيادة', en: 'Leadership' };
                break;
            case 'hr':
                categoryName = { ar: 'الموارد البشرية', en: 'Human Resources' };
                break;
            case 'gm':
                categoryName = { ar: 'المدير العام', en: 'General Manager' };
                break;
        }

        await EvaluationCriteria.findByIdAndUpdate(req.params.id, {
            name: {
                ar: name_ar,
                en: name_en
            },
            description: {
                ar: description_ar,
                en: description_en
            },
            category,
            categoryName,
            section,
            maxScore: parseInt(maxScore) || 5,
            weight: parseFloat(weight) || 0,
            performanceLevels,
            subCriteria
        });

        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&success=criteria_updated');
    } catch (error) {
        console.error('Error updating criteria:', error);
        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&error=criteria_update_failed');
    }
});

// حذف معيار التقييم
router.delete('/criteria/:id', requireAdmin, async (req, res) => {
    try {
        await EvaluationCriteria.findByIdAndUpdate(req.params.id, { isActive: false });
        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&success=criteria_deleted');
    } catch (error) {
        console.error('Error deleting criteria:', error);
        res.redirect('/admin/evaluation/criteria?lang=' + (req.query.lang || 'ar') + '&error=criteria_delete_failed');
    }
});

// صفحة إدخال نتائج التقييم
router.get('/evaluations', requireAuth, async (req, res) => {
    try {
        const evaluations = await PerformanceEvaluation.find()
            .populate('employee', 'name position')
            .populate('department', 'name')
            .populate('evaluator', 'name')
            .sort({ evaluationDate: -1 });
        
        const employees = await Employee.find({ isActive: true })
            .populate('department', 'name');
        
        const departments = await Department.find({ isActive: true });
        
        // الحصول على معايير التقييم
        const criteria = await EvaluationCriteria.find({ isActive: true });

        res.render('admin/performance-evaluations', {
            title: res.locals.lang === 'ar' ? 'تقييمات الأداء' : 'Performance Evaluations',
            user: req.session.user,
            evaluations,
            employees,
            departments,
            criteria,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error loading evaluations:', error);
        res.status(500).render('error', {
            error: res.locals.lang === 'ar' ? 'خطأ في تحميل تقييمات الأداء' : 'Error loading performance evaluations'
        });
    }
});

// بدء تقييم جديد
router.post('/evaluations', requireAuth, async (req, res) => {
    try {
        const { employeeId, evaluationPeriod, position, departmentId } = req.body;
        
        // الحصول على بيانات الموظف
        const employee = await Employee.findById(employeeId).populate('department');
        if (!employee) {
            return res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&error=employee_not_found');
        }
        
        // التحقق من عدم وجود تقييم مكرر لنفس الفترة
        const existingEvaluation = await PerformanceEvaluation.findOne({
            employee: employeeId,
            evaluationPeriod: evaluationPeriod
        });
        
        if (existingEvaluation) {
            return res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&error=evaluation_exists');
        }
        
        // الحصول على معايير التقييم
        const criteria = await EvaluationCriteria.find({ isActive: true });
        
        // تجهيز هيكل التقييم
        const evaluationData = {
            employee: employeeId,
            evaluator: req.session.user.id,
            evaluationPeriod,
            position: position || employee.position?.ar || '',
            department: departmentId || employee.department?._id,
            
            executiveInfo: {
                executiveName: employee.name?.ar || '',
                performanceReviewDate: new Date(),
                dateInCurrentPosition: employee.hireDate || new Date(),
                dateOfJoiningHotel: employee.hireDate || new Date(),
                directSupervisorName: req.session.user.name || ''
            },
            
            evaluations: {
                hod: { ratings: [], totalScore: 0, maxScore: 0, percentage: 0 },
                hr: { ratings: [], totalScore: 0, maxScore: 0, percentage: 0 },
                gm: { ratings: [], totalScore: 0, maxScore: 0, percentage: 0, remarks: '' }
            },
            
            overallRatings: {
                qualityOfWork: { score: 0, comments: '' },
                productivity: { score: 0, comments: '' },
                problemSolving: { score: 0, comments: '' },
                customerService: { score: 0, comments: '' },
                management: { score: 0, comments: '' },
                leadership: { score: 0, comments: '' }
            }
        };
        
        // إضافة المعايير إلى التقييم
        criteria.forEach(criterion => {
            const rating = {
                criteria: criterion._id,
                score: 0,
                comments: '',
                obtainedRating: 0,
                maxRating: criterion.maxScore,
                decimalScore: 0
            };
            
            if (criterion.section === 'hod') {
                evaluationData.evaluations.hod.ratings.push(rating);
            } else if (criterion.section === 'hr') {
                evaluationData.evaluations.hr.ratings.push(rating);
            } else if (criterion.section === 'gm') {
                evaluationData.evaluations.gm.ratings.push(rating);
            }
        });
        
        const evaluation = new PerformanceEvaluation(evaluationData);
        await evaluation.save();
        
        res.redirect('/admin/evaluation/evaluations/' + evaluation._id + '?lang=' + (req.query.lang || 'ar'));
    } catch (error) {
        console.error('Error creating evaluation:', error);
        res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&error=evaluation_create_failed');
    }
});

// صفحة تعديل التقييم
router.get('/evaluations/:id', requireAuth, async (req, res) => {
    try {
        const evaluation = await PerformanceEvaluation.findById(req.params.id)
            .populate('employee')
            .populate('department')
            .populate('evaluator')
            .populate({
                path: 'evaluations.hod.ratings.criteria',
                model: 'EvaluationCriteria'
            })
            .populate({
                path: 'evaluations.hr.ratings.criteria',
                model: 'EvaluationCriteria'
            })
            .populate({
                path: 'evaluations.gm.ratings.criteria',
                model: 'EvaluationCriteria'
            });
        
        if (!evaluation) {
            return res.status(404).render('error', {
                error: res.locals.lang === 'ar' ? 'التقييم غير موجود' : 'Evaluation not found'
            });
        }
        
        const criteria = await EvaluationCriteria.find({ isActive: true });
        
        res.render('admin/evaluation-form', {
            title: res.locals.lang === 'ar' ? 'تعديل التقييم' : 'Edit Evaluation',
            user: req.session.user,
            evaluation,
            criteria,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error loading evaluation:', error);
        res.status(500).render('error', {
            error: res.locals.lang === 'ar' ? 'خطأ في تحميل التقييم' : 'Error loading evaluation'
        });
    }
});

// تحديث نتائج التقييم
router.put('/evaluations/:id', requireAuth, async (req, res) => {
    try {
        const evaluation = await PerformanceEvaluation.findById(req.params.id);
        if (!evaluation) {
            return res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&error=evaluation_not_found');
        }
        
        // تحديث المعلومات التنفيذية
        if (req.body.executiveInfo) {
            evaluation.executiveInfo = {
                ...evaluation.executiveInfo,
                ...req.body.executiveInfo
            };
        }
        
        // تحديث المؤهلات الجديدة
        if (req.body.qualifications) {
            evaluation.newQualifications = JSON.parse(req.body.qualifications);
        }
        
        // تحديث التقييمات التفصيلية
        if (req.body.ratings) {
            const ratings = JSON.parse(req.body.ratings);
            
            // تحديث تقييم HOD
            if (ratings.hod) {
                evaluation.evaluations.hod.ratings = evaluation.evaluations.hod.ratings.map(rating => {
                    const updatedRating = ratings.hod.find(r => r.criteriaId === rating.criteria.toString());
                    if (updatedRating) {
                        return {
                            ...rating.toObject(),
                            score: parseFloat(updatedRating.score) || 0,
                            comments: updatedRating.comments || '',
                            obtainedRating: parseFloat(updatedRating.obtainedRating) || 0,
                            decimalScore: parseFloat(updatedRating.decimalScore) || 0
                        };
                    }
                    return rating;
                });
            }
            
            // تحديث تقييم HR
            if (ratings.hr) {
                evaluation.evaluations.hr.ratings = evaluation.evaluations.hr.ratings.map(rating => {
                    const updatedRating = ratings.hr.find(r => r.criteriaId === rating.criteria.toString());
                    if (updatedRating) {
                        return {
                            ...rating.toObject(),
                            score: parseFloat(updatedRating.score) || 0,
                            comments: updatedRating.comments || '',
                            obtainedRating: parseFloat(updatedRating.obtainedRating) || 0,
                            decimalScore: parseFloat(updatedRating.decimalScore) || 0
                        };
                    }
                    return rating;
                });
            }
            
            // تحديث تقييم GM
            if (ratings.gm) {
                evaluation.evaluations.gm.ratings = evaluation.evaluations.gm.ratings.map(rating => {
                    const updatedRating = ratings.gm.find(r => r.criteriaId === rating.criteria.toString());
                    if (updatedRating) {
                        return {
                            ...rating.toObject(),
                            score: parseFloat(updatedRating.score) || 0,
                            comments: updatedRating.comments || '',
                            obtainedRating: parseFloat(updatedRating.obtainedRating) || 0,
                            decimalScore: parseFloat(updatedRating.decimalScore) || 0
                        };
                    }
                    return rating;
                });
                
                if (ratings.gmRemarks) {
                    evaluation.evaluations.gm.remarks = ratings.gmRemarks;
                }
            }
        }
        
        // تحديث التقييم الشامل
        if (req.body.overallRatings) {
            evaluation.overallRatings = {
                ...evaluation.overallRatings,
                ...req.body.overallRatings
            };
        }
        
        // تحديث تعليقات الموظف
        if (req.body.employeeComments) {
            evaluation.employeeComments = req.body.employeeComments;
        }
        
        // تحديث الحالة
        if (req.body.status) {
            evaluation.status = req.body.status;
        }
        
        await evaluation.save();
        
        res.redirect('/admin/evaluation/evaluations/' + req.params.id + '?lang=' + (req.query.lang || 'ar') + '&success=evaluation_updated');
    } catch (error) {
        console.error('Error updating evaluation:', error);
        res.redirect('/admin/evaluation/evaluations/' + req.params.id + '?lang=' + (req.query.lang || 'ar') + '&error=evaluation_update_failed');
    }
});

// حذف التقييم
router.delete('/evaluations/:id', requireAuth, async (req, res) => {
    try {
        await PerformanceEvaluation.findByIdAndUpdate(req.params.id, { isActive: false });
        res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&success=evaluation_deleted');
    } catch (error) {
        console.error('Error deleting evaluation:', error);
        res.redirect('/admin/evaluation/evaluations?lang=' + (req.query.lang || 'ar') + '&error=evaluation_delete_failed');
    }
});

module.exports = router;