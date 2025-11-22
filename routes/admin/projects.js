const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('admin/projects', {
            title: 'إدارة المشاريع'
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        res.status(500).render('error', { error: 'خطأ في تحميل بيانات المشاريع' });
    }
});

module.exports = router;