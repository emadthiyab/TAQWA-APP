const express = require('express');
const router = express.Router();
const Department = require('../../models/Department');

// إدارة الإدارات - الصفحة الرئيسية
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.render('admin/departments', {
            departments,
            title: 'إدارة الإدارات'
        });
    } catch (error) {
        console.error('Error loading departments:', error);
        res.status(500).render('error', { error: 'خطأ في تحميل بيانات الإدارات' });
    }
});

// إضافة إدارة جديدة
router.post('/add', async (req, res) => {
    try {
        const {
            name,
            nameEn,
            description,
            descriptionEn,
            manager,
            contactEmail,
            phone
        } = req.body;

        const newDepartment = new Department({
            name,
            nameEn,
            description,
            descriptionEn,
            manager,
            contactEmail,
            phone
        });

        await newDepartment.save();

        res.json({ 
            success: true, 
            message: 'تم إضافة الإدارة بنجاح',
            department: newDepartment
        });

    } catch (error) {
        console.error('Error adding department:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء إضافة الإدارة' 
        });
    }
});

// تحديث إدارة
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            nameEn,
            description,
            descriptionEn,
            manager,
            contactEmail,
            phone,
            isActive
        } = req.body;

        const updatedDepartment = await Department.findByIdAndUpdate(
            id, 
            {
                name,
                nameEn,
                description,
                descriptionEn,
                manager,
                contactEmail,
                phone,
                isActive: isActive === 'true'
            }, 
            { new: true }
        );

        res.json({ 
            success: true, 
            message: 'تم تحديث بيانات الإدارة بنجاح',
            department: updatedDepartment
        });

    } catch (error) {
        console.error('Error updating department:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء تحديث بيانات الإدارة' 
        });
    }
});

// حذف إدارة
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Department.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'تم حذف الإدارة بنجاح' 
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء حذف الإدارة' 
        });
    }
});

// الحصول على بيانات إدارة
router.get('/get/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        res.json(department);
    } catch (error) {
        console.error('Error getting department:', error);
        res.status(500).json({ error: 'خطأ في تحميل بيانات الإدارة' });
    }
});

module.exports = router;