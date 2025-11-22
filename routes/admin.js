const express = require('express');
const router = express.Router();

// Middleware to check admin access
router.use((req, res, next) => {
    if (!req.session.user || req.session.interface !== 'admin') {
        return res.redirect('/login');
    }
    if (!['مدير', 'محرر'].includes(req.session.user.role)) {
        return res.redirect('/user/dashboard');
    }
    next();
});

// Admin dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard', {
        title: 'لوحة تحكم الإدارة',
        user: req.session.user
    });
});

// Users management
router.get('/users', (req, res) => {
    res.render('admin/users', {
        title: 'إدارة المستخدمين',
        user: req.session.user
    });
});

// Departments management
router.get('/departments', (req, res) => {
    res.render('admin/departments', {
        title: 'إدارة الإدارات',
        user: req.session.user
    });
});

// مسار التحليلات
router.get('/analytics', async (req, res) => {
    try {
        const analyticsData = {
            monthlyPerformance: [65, 75, 80, 85, 78, 92, 88, 95, 90, 85, 92, 95],
            departmentStats: [
                { name: 'الإدارة', value: 92 },
                { name: 'خدمات الغرف', value: 85 },
                { name: 'المطبخ', value: 78 },
                { name: 'الاستقبال', value: 88 }
            ]
        };

        res.render('admin/analytics', {
            title: res.locals.t.analytics,
            user: req.session.user,
            analyticsData: analyticsData
        });
    } catch (error) {
        console.error('Error loading analytics:', error);
        res.status(500).render('error', {
            error: res.locals.lang === 'ar' ? 'خطأ في تحميل التحليلات' : 'Error loading analytics'
        });
    }
});

// مسار الإعدادات
router.get('/settings', async (req, res) => {
    try {
        const settingsData = {
            hotelName: 'فندق دار التقوى',
            defaultLanguage: 'ar',
            timeZone: 'Asia/Riyadh'
        };

        res.render('admin/settings', {
            title: res.locals.t.settings,
            user: req.session.user,
            settings: settingsData,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error loading settings:', error);
        res.status(500).render('error', {
            error: res.locals.lang === 'ar' ? 'خطأ في تحميل الإعدادات' : 'Error loading settings'
        });
    }
});

router.post('/settings', async (req, res) => {
    try {
        const { hotelName, defaultLanguage, timeZone } = req.body;

        // حفظ الإعدادات
        console.log('Settings updated:', { hotelName, defaultLanguage, timeZone });

        res.redirect('/admin/settings?lang=' + (req.query.lang || 'ar') + '&success=1');
    } catch (error) {
        console.error('Error updating settings:', error);
        res.redirect('/admin/settings?lang=' + (req.query.lang || 'ar') + '&error=1');
    }
});

module.exports = router;