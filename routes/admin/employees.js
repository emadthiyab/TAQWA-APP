const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('admin/employees', {
            title: 'إدارة الموظفين'
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        res.status(500).render('error', { error: 'خطأ في تحميل بيانات الموظفين' });
    }
});

module.exports = router;