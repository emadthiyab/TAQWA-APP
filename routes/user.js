const express = require('express');
const router = express.Router();
const KPI = require('../models/KPI');
const Project = require('../models/Project');
const Report = require('../models/Report');
const Employee = require('../models/Employee');

// صفحة مؤشرات الأداء الشخصية
router.get('/kpis', async (req, res) => {
    try {
        const userKPIs = await KPI.find({ assignedTo: req.session.user.id })
            .populate('department')
            .sort({ createdAt: -1 });
        
        res.render('user/kpis', {
            title: res.locals.t.myKPIs,
            userKPIs
        });
    } catch (error) {
        console.error('Error loading user KPIs:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorLoadingKPIs || 'Error loading KPIs' 
        });
    }
});

// صفحة المشاريع
router.get('/projects', async (req, res) => {
    try {
        const userProjects = await Project.find({ assignedTo: req.session.user.id })
            .populate('department')
            .sort({ createdAt: -1 });
        
        res.render('user/projects', {
            title: res.locals.t.projectsTracking,
            userProjects
        });
    } catch (error) {
        console.error('Error loading user projects:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorLoadingProjects || 'Error loading projects' 
        });
    }
});

// صفحة البلاغات
router.get('/reports', async (req, res) => {
    try {
        const userReports = await Report.find({ createdBy: req.session.user.id })
            .populate('department')
            .sort({ createdAt: -1 });
        
        res.render('user/reports', {
            title: res.locals.t.reportsTracking,
            userReports
        });
    } catch (error) {
        console.error('Error loading user reports:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorLoadingReports || 'Error loading reports' 
        });
    }
});

// صفحة أداء الموظفين (للمشرفين)
router.get('/employees', async (req, res) => {
    try {
        const userEmployees = await Employee.find({ department: req.session.user.departmentId })
            .populate('department')
            .sort({ createdAt: -1 });
        
        res.render('user/employees', {
            title: res.locals.t.employeesTracking,
            userEmployees
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorLoadingEmployees || 'Error loading employees' 
        });
    }
});

// صفحة التقارير والمؤشرات
router.get('/performance', async (req, res) => {
    try {
        const userKPIs = await KPI.find({ assignedTo: req.session.user.id })
            .populate('department')
            .sort({ createdAt: -1 });
        
        const userProjects = await Project.find({ assignedTo: req.session.user.id })
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.render('user/performance', {
            title: res.locals.t.performanceReports,
            userKPIs,
            userProjects
        });
    } catch (error) {
        console.error('Error loading performance data:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorLoadingPerformance || 'Error loading performance data' 
        });
    }
});

// إضافة بلاغ جديد
router.post('/reports', async (req, res) => {
    try {
        const { title, description, type, priority } = req.body;
        
        const report = new Report({
            title,
            description,
            type,
            priority,
            createdBy: req.session.user.id,
            department: req.session.user.departmentId,
            status: 'pending'
        });
        
        await report.save();
        
        res.redirect('/user/reports?lang=' + (req.query.lang || 'ar'));
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorCreatingReport || 'Error creating report' 
        });
    }
});

// تحديث تقدم KPI
router.put('/kpis/:id', async (req, res) => {
    try {
        const { progress } = req.body;
        
        await KPI.findByIdAndUpdate(req.params.id, {
            progress: parseInt(progress),
            updatedAt: new Date()
        });
        
        res.redirect('/user/kpis?lang=' + (req.query.lang || 'ar'));
    } catch (error) {
        console.error('Error updating KPI:', error);
        res.status(500).render('error', { 
            error: res.locals.t.errorUpdatingKPI || 'Error updating KPI' 
        });
    }
});

module.exports = router;