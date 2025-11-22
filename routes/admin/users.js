const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Department = require('../../models/Department');

// إدارة المستخدمين - الصفحة الرئيسية
router.get('/', async (req, res) => {
    try {
        const users = await User.find().populate('department').sort({ createdAt: -1 });
        const departments = await Department.find({ isActive: true });
        
        res.render('admin/users', {
            users,
            departments,
            title: 'إدارة المستخدمين'
        });
    } catch (error) {
        console.error('Error loading users:', error);
        res.status(500).render('error', { error: 'خطأ في تحميل بيانات المستخدمين' });
    }
});

// إضافة مستخدم جديد
router.post('/add', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            fullName,
            fullNameEn,
            department,
            role,
            phone
        } = req.body;

        // التحقق من وجود المستخدم مسبقاً
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.json({ 
                success: false, 
                message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' 
            });
        }

        // تحديد الدور بالإنجليزية
        let roleEn = 'User';
        if (role === 'مدير') roleEn = 'Admin';
        else if (role === 'محرر') roleEn = 'Editor';

        const newUser = new User({
            username,
            email,
            password,
            fullName,
            fullNameEn,
            department,
            role,
            roleEn,
            phone
        });

        await newUser.save();

        res.json({ 
            success: true, 
            message: 'تم إضافة المستخدم بنجاح',
            user: newUser
        });

    } catch (error) {
        console.error('Error adding user:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء إضافة المستخدم' 
        });
    }
});

// تحديث مستخدم
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            password,
            fullName,
            fullNameEn,
            department,
            role,
            phone,
            isActive
        } = req.body;

        // تحديد الدور بالإنجليزية
        let roleEn = 'User';
        if (role === 'مدير') roleEn = 'Admin';
        else if (role === 'محرر') roleEn = 'Editor';

        const updateData = {
            username,
            email,
            fullName,
            fullNameEn,
            department,
            role,
            roleEn,
            phone,
            isActive: isActive === 'true'
        };

        // تحديث كلمة المرور إذا تم تقديمها
        if (password) {
            updateData.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).populate('department');

        res.json({ 
            success: true, 
            message: 'تم تحديث بيانات المستخدم بنجاح',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء تحديث بيانات المستخدم' 
        });
    }
});

// حذف مستخدم
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'تم حذف المستخدم بنجاح' 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.json({ 
            success: false, 
            message: 'حدث خطأ أثناء حذف المستخدم' 
        });
    }
});

// الحصول على بيانات مستخدم
router.get('/get/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('department');
        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'خطأ في تحميل بيانات المستخدم' });
    }
});

module.exports = router;