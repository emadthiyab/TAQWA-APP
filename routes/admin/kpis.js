const express = require('express');
const router = express.Router();
const KPI = require('../../models/KPI');
const Department = require('../../models/Department');
const Employee = require('../../models/Employee');

// إدارة المؤشرات - الصفحة الرئيسية
router.get('/', async (req, res) => {
    try {
        const kpis = await KPI.find()
            .populate('department')
            .sort({ createdAt: -1 });
        
        const departments = await Department.find({ isActive: true });
        const employees = await Employee.find({ isActive: true });
        
        res.render('admin/kpis', {
            kpis,
            departments,
            employees,
            title: 'إدارة مؤشرات الأداء',
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error loading KPIs:', error);
        res.status(500).render('error/500', { 
            error: error.message,
            lang: req.query.lang || 'ar'
        });
    }
});

// إضافة مؤشر جديد
router.post('/', async (req, res) => {
    try {
        const {
            name_ar,
            name_en,
            description_ar,
            description_en,
            calculationMethod_ar,
            calculationMethod_en,
            department,
            assignedTo,
            target,
            unit,
            measurementCycle,
            deadline,
            currentValue,
            progress,
            status
        } = req.body;

        const newKPI = new KPI({
            name: {
                ar: name_ar,
                en: name_en
            },
            description: {
                ar: description_ar,
                en: description_en
            },
            calculationMethod: {
                ar: calculationMethod_ar,
                en: calculationMethod_en
            },
            department,
            assignedTo: assignedTo || null,
            target: parseFloat(target),
            unit: unit || '%',
            measurementCycle: measurementCycle || 'شهري',
            deadline: deadline || null,
            currentValue: currentValue ? parseFloat(currentValue) : 0,
            progress: progress ? parseFloat(progress) : 0,
            status: status || 'معلق'
        });

        await newKPI.save();

        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&success=kpi_created');

    } catch (error) {
        console.error('Error adding KPI:', error);
        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&error=kpi_create_failed');
    }
});

// تحديث مؤشر أداء
router.put('/:id', async (req, res) => {
    try {
        const {
            name_ar,
            name_en,
            description_ar,
            description_en,
            calculationMethod_ar,
            calculationMethod_en,
            department,
            assignedTo,
            target,
            unit,
            measurementCycle,
            deadline,
            currentValue,
            progress,
            status
        } = req.body;

        // تحديث بيانات المؤشر الأساسية
        const updateData = {
            name: {
                ar: name_ar,
                en: name_en
            },
            description: {
                ar: description_ar,
                en: description_en
            },
            calculationMethod: {
                ar: calculationMethod_ar,
                en: calculationMethod_en
            },
            department,
            assignedTo: assignedTo || null,
            target: parseFloat(target),
            unit: unit || '%',
            measurementCycle: measurementCycle || 'شهري',
            deadline: deadline || null,
            status: status || 'معلق'
        };

        // إذا تم تقديم قيمة حالية، تحديثها وحساب التقدم
        if (currentValue !== undefined && currentValue !== '') {
            const currentVal = parseFloat(currentValue);
            const targetVal = parseFloat(target);
            updateData.currentValue = currentVal;
            updateData.progress = targetVal > 0 ? (currentVal / targetVal) * 100 : 0;
            
            // تحديث الحالة بناءً على التقدم
            if (updateData.progress >= 100) {
                updateData.status = 'مكتمل';
            } else if (updateData.progress > 0) {
                updateData.status = 'في التقدم';
            } else {
                updateData.status = 'معلق';
            }
        }

        await KPI.findByIdAndUpdate(req.params.id, updateData);

        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&success=kpi_updated');

    } catch (error) {
        console.error('Error updating KPI:', error);
        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&error=kpi_update_failed');
    }
});

// تحديث النتائج الربعية
router.put('/:id/quarterly-results', async (req, res) => {
    try {
        const { q1, q2, q3, q4, justification } = req.body;

        // الحصول على المؤشر الحالي
        const kpi = await KPI.findById(req.params.id);
        if (!kpi) {
            return res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&error=kpi_not_found');
        }

        // تحديث النتائج الربعية
        const updateData = {
            quarterResults: {
                q1: q1 ? parseFloat(q1) : kpi.quarterResults.q1,
                q2: q2 ? parseFloat(q2) : kpi.quarterResults.q2,
                q3: q3 ? parseFloat(q3) : kpi.quarterResults.q3,
                q4: q4 ? parseFloat(q4) : kpi.quarterResults.q4
            },
            justification: justification || kpi.justification
        };

        // حساب التقدم الربعي
        updateData.quarterProgress = {
            q1: kpi.target > 0 ? (updateData.quarterResults.q1 / kpi.target) * 100 : 0,
            q2: kpi.target > 0 ? (updateData.quarterResults.q2 / kpi.target) * 100 : 0,
            q3: kpi.target > 0 ? (updateData.quarterResults.q3 / kpi.target) * 100 : 0,
            q4: kpi.target > 0 ? (updateData.quarterResults.q4 / kpi.target) * 100 : 0
        };

        // تحديث القيمة الحالية بناءً على أحدث ربع
        const latestResult = updateData.quarterResults.q4 || updateData.quarterResults.q3 || 
                           updateData.quarterResults.q2 || updateData.quarterResults.q1 || 0;
        
        updateData.currentValue = latestResult;
        updateData.progress = kpi.target > 0 ? (latestResult / kpi.target) * 100 : 0;

        // تحديث الحالة بناءً على التقدم
        if (updateData.progress >= 100) {
            updateData.status = 'مكتمل';
        } else if (updateData.progress > 0) {
            updateData.status = 'في التقدم';
        } else {
            updateData.status = 'معلق';
        }

        await KPI.findByIdAndUpdate(req.params.id, updateData);

        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&success=quarterly_results_updated');

    } catch (error) {
        console.error('Error updating quarterly results:', error);
        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&error=quarterly_update_failed');
    }
});

// حذف مؤشر أداء
router.delete('/:id', async (req, res) => {
    try {
        await KPI.findByIdAndDelete(req.params.id);
        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&success=kpi_deleted');
    } catch (error) {
        console.error('Error deleting KPI:', error);
        res.redirect('/admin/kpis?lang=' + (req.query.lang || 'ar') + '&error=kpi_delete_failed');
    }
});

// الحصول على بيانات مؤشر معين (للتعديل)
router.get('/:id', async (req, res) => {
    try {
        const kpi = await KPI.findById(req.params.id)
            .populate('department')
            .populate('assignedTo');
        
        if (!kpi) {
            return res.status(404).json({ 
                success: false, 
                message: 'المؤشر غير موجود' 
            });
        }

        res.json({
            success: true,
            kpi: kpi
        });

    } catch (error) {
        console.error('Error fetching KPI:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في جلب بيانات المؤشر' 
        });
    }
});

// تحديث القيمة الحالية للمؤشر (لواجهة المستخدم)
router.patch('/:id/current-value', async (req, res) => {
    try {
        const { currentValue, justification } = req.body;

        const kpi = await KPI.findById(req.params.id);
        if (!kpi) {
            return res.status(404).json({ 
                success: false, 
                message: 'المؤشر غير موجود' 
            });
        }

        const newValue = parseFloat(currentValue);
        const progress = kpi.target > 0 ? (newValue / kpi.target) * 100 : 0;

        const updateData = {
            currentValue: newValue,
            progress: progress,
            justification: justification || kpi.justification
        };

        // تحديث الحالة بناءً على التقدم
        if (progress >= 100) {
            updateData.status = 'مكتمل';
        } else if (progress > 0) {
            updateData.status = 'في التقدم';
        } else {
            updateData.status = 'معلق';
        }

        await KPI.findByIdAndUpdate(req.params.id, updateData);

        res.json({
            success: true,
            message: 'تم تحديث القيمة بنجاح',
            kpi: await KPI.findById(req.params.id)
        });

    } catch (error) {
        console.error('Error updating current value:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في تحديث القيمة' 
        });
    }
});

// إحصائيات المؤشرات
router.get('/api/stats', async (req, res) => {
    try {
        const totalKPIs = await KPI.countDocuments();
        const completedKPIs = await KPI.countDocuments({ status: 'مكتمل' });
        const inProgressKPIs = await KPI.countDocuments({ status: 'في التقدم' });
        const pendingKPIs = await KPI.countDocuments({ status: 'معلق' });

        // متوسط التقدم العام
        const kpis = await KPI.find();
        const totalProgress = kpis.reduce((sum, kpi) => sum + kpi.progress, 0);
        const averageProgress = kpis.length > 0 ? totalProgress / kpis.length : 0;

        res.json({
            success: true,
            stats: {
                totalKPIs,
                completedKPIs,
                inProgressKPIs,
                pendingKPIs,
                averageProgress: Math.round(averageProgress)
            }
        });

    } catch (error) {
        console.error('Error fetching KPI stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في جلب الإحصائيات' 
        });
    }
});

module.exports = router;