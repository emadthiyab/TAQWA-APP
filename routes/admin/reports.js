const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('admin/reports', {
            title: 'إدارة البلاغات'
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        res.status(500).render('error', { error: 'خطأ في تحميل بيانات البلاغات' });
    }
});

module.exports = router;