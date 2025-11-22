const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    
    res.render('auth/login', { 
        title: 'تسجيل الدخول',
        error: null,
        success: null
    });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { username, password, interface } = req.body;
        
        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
            isActive: true
        });

        if (!user) {
            return res.render('auth/login', {
                title: 'تسجيل الدخول',
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
                success: null
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.render('auth/login', {
                title: 'تسجيل الدخول',
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
                success: null
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            department: user.department,
            role: user.role,
            permissions: user.permissions
        };
        req.session.interface = interface;

        // Redirect based on role and interface
        if (interface === 'admin' && (user.role === 'مدير' || user.role === 'محرر')) {
            return res.redirect('/admin/dashboard');
        } else if (interface === 'user') {
            return res.redirect('/user/dashboard');
        } else {
            return res.render('auth/login', {
                title: 'تسجيل الدخول',
                error: 'ليس لديك صلاحية للدخول إلى هذه الواجهة',
                success: null
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', {
            title: 'تسجيل الدخول',
            error: 'حدث خطأ أثناء تسجيل الدخول',
            success: null
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Language switch
router.post('/switch-language', (req, res) => {
    const { language } = req.body;
    if (['ar', 'en'].includes(language)) {
        req.session.language = language;
    }
    res.json({ success: true });
});

module.exports = router;