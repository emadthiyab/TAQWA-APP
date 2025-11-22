const express = require('express');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const KPI = require('../models/KPI');
const Project = require('../models/Project');
const Report = require('../models/Report');
const router = express.Router();

// صفحة استيراد البيانات
router.get('/', async (req, res) => {
    try {
        const departmentsCount = await Department.countDocuments();
        const kpisCount = await KPI.countDocuments();
        const employeesCount = await Employee.countDocuments();

        res.render('admin/import', {
            title: 'استيراد البيانات',
            user: req.session.user,
            success: req.query.success,
            error: req.query.error,
            departments: req.query.departments,
            employees: req.query.employees,
            deleted: req.query.deleted,
            kpis: req.query.kpis,
            departmentsCount,
            kpisCount,
            employeesCount
        });
    } catch (error) {
        console.error('Error loading import page:', error);
        res.status(500).render('error', {
            error: 'خطأ في تحميل صفحة الاستيراد'
        });
    }
});

// معالجة استيراد البيانات من ملف محدد
router.post('/manual-import', async (req, res) => {
    try {
        const importResults = {
            departments: 0,
            employees: 0,
            errors: []
        };

        // استيراد الإدارات الأساسية من ملف Excel
        await importBasicData(importResults);

        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&success=1&departments=' + importResults.departments);

    } catch (error) {
        console.error('Error importing data:', error);
        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&error=import_failed');
    }
});

// استيراد مؤشرات الأداء من بيانات Excel المضمنة
router.post('/kpis-import', async (req, res) => {
    try {
        const importResults = {
            kpis: 0,
            errors: []
        };

        // استيراد مؤشرات الأداء من البيانات المضمنة
        await importKPIsFromData(importResults);

        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&success=kpis_imported&kpis=' + importResults.kpis);

    } catch (error) {
        console.error('Error importing KPIs:', error);
        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&error=kpis_import_failed');
    }
});

// دالة استيراد البيانات الأساسية
async function importBasicData(results) {
    try {
        // إنشاء الإدارات الأساسية من بيانات Excel
        const departmentsData = [
            {
                name: { ar: 'المحاسبة والمالية', en: 'Accounting & Finance' },
                description: 'إدارة المحاسبة والمالية والميزانيات',
                manager: 'مدير المحاسبة',
                email: 'accounting@taqwahotel.com',
                phone: '+966123456789',
                isActive: true
            },
            {
                name: { ar: 'المشتريات', en: 'Procurement' },
                description: 'إدارة المشتريات والموردين',
                manager: 'مدير المشتريات',
                email: 'procurement@taqwahotel.com',
                phone: '+966123456790',
                isActive: true
            },
            {
                name: { ar: 'المبيعات والحجوزات', en: 'Sales & Reservations' },
                description: 'إدارة المبيعات والحجوزات والتسويق',
                manager: 'مدير المبيعات',
                email: 'sales@taqwahotel.com',
                phone: '+966123456791',
                isActive: true
            },
            {
                name: { ar: 'الطعام والمشروبات', en: 'Food & Beverage' },
                description: 'إدارة الطعام والمشروبات والمطاعم',
                manager: 'مدير الطعام والمشروبات',
                email: 'f&b@taqwahotel.com',
                phone: '+966123456792',
                isActive: true
            },
            {
        	name: { ar: 'التدبير المنزلي', en: 'Housekeeping' },
        	description: 'إدارة التدبير المنزلي والنظافة',
        	manager: 'مدير التدبير المنزلي',
        	email: 'housekeeping@taqwahotel.com',
        	phone: '+966123456794',
        	isActive: true
    	       },
    	       {
        	name: { ar: 'الاستقبال', en: 'Front Office' },
	        description: 'إدارة الاستقبال والخدمات الأمامية',
	   manager: 'مدير الاستقبال',
	   email: 'frontoffice@taqwahotel.com',
        	phone: '+966123456799',
	        isActive: true
    	       },
                 {
	        name: { ar: 'الموارد البشرية', en: 'Human Resources' },
        	description: 'إدارة الموارد البشرية والتدريب',
	   manager: 'مدير الموارد البشرية',
	   email: 'hr@taqwahotel.com',
	        phone: '+966123456793',
	        isActive: true
	    },
            {
                name: { ar: 'الهندسة والصيانة', en: 'Engineering & Maintenance' },
                description: 'إدارة الهندسة والصيانة والمرافق',
                manager: 'مدير الهندسة',
                email: 'engineering@taqwahotel.com',
                phone: '+966123456795',
                isActive: true
            },
            {
                name: { ar: 'الأمن والسلامة', en: 'Security & Safety' },
                description: 'إدارة الأمن والسلامة والطوارئ',
                manager: 'مدير الأمن',
                email: 'security@taqwahotel.com',
                phone: '+966123456796',
                isActive: true
            },
            {
                name: { ar: 'المطبخ', en: 'Kitchen' },
                description: 'إدارة المطبخ والتحضير',
                manager: 'الشيف التنفيذي',
                email: 'kitchen@taqwahotel.com',
                phone: '+966123456797',
                isActive: true
            },
            {
                name: { ar: 'مبيعات العلاقات الحكومية', en: 'Government Relations Sales' },
                description: 'إدارة العلاقات الحكومية والعقود',
                manager: 'مدير العلاقات الحكومية',
                email: 'government@taqwahotel.com',
                phone: '+966123456798',
                isActive: true
            },
            {
                name: { ar: 'الاستقبال', en: 'Front Office' },
                description: 'إدارة الاستقبال والخدمات الأمامية',
                manager: 'مدير الاستقبال',
                email: 'frontoffice@taqwahotel.com',
                phone: '+966123456799',
                isActive: true
            },
            {
                name: { ar: 'الجودة والتميز المؤسسي', en: 'Quality & Excellence' },
                description: 'إدارة الجودة والتميز المؤسسي',
                manager: 'مدير الجودة',
                email: 'quality@taqwahotel.com',
                phone: '+966123456800',
                isActive: true
            },
            {
                name: { ar: 'تكنولوجيا المعلومات', en: 'IT Department' },
                description: 'إدارة تكنولوجيا المعلومات والأنظمة',
                manager: 'مدير تكنولوجيا المعلومات',
                email: 'it@taqwahotel.com',
                phone: '+966123456801',
                isActive: true
            }
        ];

        // إنشاء الإدارات
        for (const deptData of departmentsData) {
            const existingDept = await Department.findOne({
                $or: [
                    { 'name.ar': deptData.name.ar },
                    { 'name.en': deptData.name.en }
                ]
            });

            if (!existingDept) {
                const newDepartment = new Department(deptData);
                await newDepartment.save();
                results.departments++;
                console.log(`✅ Created department: ${deptData.name.ar}`);
            }
        }

    } catch (error) {
        console.error('Error importing basic data:', error);
        results.errors.push({
            type: 'basic_data',
            message: error.message
        });
    }
}

// دالة استيراد مؤشرات الأداء من البيانات المضمنة
async function importKPIsFromData(results) {
    try {
        // بيانات مؤشرات الأداء من ملف Excel
        const kpisData = [
            // المحاسبة والمالية
            {
                name: { ar: 'نسبة توفير التكاليف (2%)', en: 'Cost-saving ratio (2%)' },
                description: { ar: 'نسبة التوفير في التكاليف مقارنة بالميزانية المخطط لها', en: 'Percentage of cost savings compared to the budget' },
                calculationMethod: { ar: '(التكاليف الفعلية - التكاليف المخططة) / التكاليف المخططة × 100', en: '(Actual Costs - Planned Costs) / Planned Costs × 100' },
                departmentName: 'المحاسبة والمالية',
                target: 2,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 0.2328, q2: 1, q3: 0.0135 },
                justification: 'actual cost is 21.07 Vs 23.31 budget the saving percentage is 2.24'
            },
            {
                name: { ar: 'دقة الميزانية الشهرية (95%)', en: 'Monthly budget accuracy (95%)' },
                description: { ar: 'مدى مطابقة الميزانية الفعلية للميزانية المخطط لها', en: 'Variance between actual and planned budgets' },
                calculationMethod: { ar: '(الميزانية الفعلية / الميزانية المخططة) × 100', en: '(Actual Budget / Planned Budget) × 100' },
                departmentName: 'المحاسبة والمالية',
                target: 95,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 96, q2: 91, q3: 97 },
                justification: 'due to big gap in Revenue ACHIVED Vs buadget in june 2025'
            },
            // المشتريات
            {
                name: { ar: 'نسبة الموردين المتعاقد معهم إلكترونيًا (90%)', en: 'Electronically contracted suppliers (90%)' },
                description: { ar: 'نسبة الموردين الذين تم التعاقد معهم عبر النظام الإلكتروني', en: 'Percentage of suppliers onboarded digitally' },
                calculationMethod: { ar: '(عدد الموردين المتعاقد معهم إلكترونيًا / إجمالي الموردين) × 100', en: '(Electronic Contracts / Total Suppliers) × 100' },
                departmentName: 'المشتريات',
                target: 90,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 80, q2: 4.1, q3: 7.26 },
                justification: 'The current percentage remains below the target due to the requirement for management signatures...'
            },
            {
                name: { ar: 'نسبة الدفعات المقدمة (25%)', en: 'Prepayment ratio (25%)' },
                description: { ar: 'نسبة الدفعات المقدمة للموردين مقارنة بالقيمة الإجمالية للعقود', en: 'Advance payments as a percentage of total contract value' },
                calculationMethod: { ar: '(قيمة الدفعات المقدمة / إجمالي قيمة العقود) × 100', en: '(Advance Payments / Total Contract Value) × 100' },
                departmentName: 'المشتريات',
                target: 25,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 35, q2: 50, q3: 26.8 },
                justification: 'The prepayment ratio is slightly above the target, reflecting our efforts to renegotiate supplier terms...'
            },
            // المبيعات والحجوزات
            {
                name: { ar: 'معدل نمو الإيرادات (3%)', en: 'Revenue growth rate (3%)' },
                description: { ar: 'نسبة زيادة الإيرادات مقارنة بالفترة السابقة', en: 'YoY revenue increase' },
                calculationMethod: { ar: '(الإيرادات الفعلية - الإيرادات المخططة) / الإيرادات المخططة × 100', en: '(Current Revenue - Previous Revenue) / Previous Revenue × 100' },
                departmentName: 'المبيعات والحجوزات',
                target: 3,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 0.25, q2: 0, q3: 0.4 },
                justification: 'Already achieved total 10.82% YTD'
            },
            {
                name: { ar: 'تحسين التقييمات عبر الإنترنت (8.9)', en: 'Online ratings (8.9/10)' },
                description: { ar: 'متوسط تقييم الضيوف على منصات الحجز', en: 'Average guest ratings on booking platforms' },
                calculationMethod: { ar: 'متوسط التقييمات على مواقع مثل Booking.com', en: 'Mean score from Booking.com/Google' },
                departmentName: 'المبيعات والحجوزات',
                target: 8.9,
                unit: 'نقاط',
                measurementCycle: 'شهري',
                quarterResults: { q1: 0.25, q2: 0, q3: 1 },
                justification: 'Already achived 9 rating on booking.com'
            },
            // الطعام والمشروبات
            {
                name: { ar: 'معدل نمو الإيرادات (5-10%)', en: 'Revenue growth (5-10%)' },
                description: { ar: 'نسبة زيادة إيرادات قسم الطعام والمشروبات', en: 'F&B department revenue increase' },
                calculationMethod: { ar: '(الإيرادات الفعلية - الإيرادات المخططة) / الإيرادات المخططة × 100', en: '(Current Revenue - Previous Revenue) / Previous Revenue × 100' },
                departmentName: 'الطعام والمشروبات',
                target: 7.5,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 15, q2: 4.5, q3: 6.3 },
                justification: 'Q1. Achieved: 15% Revenue, Q2. Actual Revenue to end of June...'
            },
            {
                name: { ar: 'نسبة رضا الضيوف (90%)', en: 'Guest satisfaction (90%)' },
                description: { ar: 'تقييم الضيوف لجودة الطعام والخدمة', en: 'Diner ratings for food/service' },
                calculationMethod: { ar: 'متوسط تقييم الضيوف في استبيانات الطعام', en: 'Average survey scores' },
                departmentName: 'الطعام والمشروبات',
                target: 90,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 95.4, q2: 95, q3: 96 },
                justification: 'Restaurant 98% - Room Service 92.5% -Tea Garden 95.5 - Overall UniFocus F&B 96%'
            },
            // الموارد البشرية
            {
                name: { ar: 'نسبة التوطين (45%)', en: 'Saudization ratio (45%)' },
                description: { ar: 'نسبة الموظفين السعوديين من إجمالي الموظفين', en: 'Percentage of Saudi employees' },
                calculationMethod: { ar: '(عدد الموظفين السعوديين / إجمالي الموظفين) × 100', en: '(Saudi Employees / Total Employees) × 100' },
                departmentName: 'الموارد البشرية',
                target: 45,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 41.2, q2: 44.72, q3: 90 },
                justification: ''
            },
            {
                name: { ar: 'زيادة رضا الموظفين (10% ربع سنويًا)', en: 'Employee satisfaction rate (increase by 10% quarterly)' },
                description: { ar: 'تقييم الموظفين لبيئة العمل والخدمات المقدمة لهم', en: 'Staff morale improvement' },
                calculationMethod: { ar: 'متوسط نتائج استبيانات رضا الموظفين', en: '(Current Survey Score - Previous Score) / Previous Score × 100' },
                departmentName: 'الموارد البشرية',
                target: 10,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 90.1, q2: 91, q3: 70 },
                justification: ''
            },
            // التدبير المنزلي
            {
                name: { ar: 'نسبة رضا الضيوف عن النظافة (9.1)', en: 'Cleanliness satisfaction (9.1/10)' },
                description: { ar: 'تقييم الضيوف لنظافة الغرف والمرافق', en: 'Guest ratings for room cleanliness' },
                calculationMethod: { ar: 'متوسط تقييم الضيوف على منصات مثل Booking.com أو استبيانات الفندق', en: 'Average cleanliness scores' },
                departmentName: 'التدبير المنزلي',
                target: 9.1,
                unit: 'نقاط',
                measurementCycle: 'شهري',
                quarterResults: { q1: 9.3, q2: 9.1, q3: 9.1 },
                justification: 'Currently stands at 9.3 in Boking.com & 9.10 in Unifocus'
            },
            // الهندسة والصيانة
            {
                name: { ar: 'تقليل أعطال المعدات (10%)', en: 'Equipment failure reduction (10%)' },
                description: { ar: 'نسبة الانخفاض في عدد الأعطال الفنية', en: 'Fewer breakdowns of machinery' },
                calculationMethod: { ar: '(عدد الأعطال السابقة - عدد الأعطال الفعلية) / عدد الأعطال السابقة × 100', en: '(Previous Failures - Current Failures) / Previous Failures × 100' },
                departmentName: 'الهندسة والصيانة',
                target: 10,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 25, q2: 66.67, q3: 0 },
                justification: ''
            },
            // الأمن والسلامة
            {
                name: { ar: 'تقليل الحوادث الأمنية (20%)', en: 'Security incident reduction (20%)' },
                description: { ar: 'نسبة الانخفاض في عدد الحوادث الأمنية', en: 'Fewer safety violations' },
                calculationMethod: { ar: '(عدد الحوادث السابقة - عدد الحوادث الفعلية) / عدد الحوادث السابقة × 100', en: '(Previous Incidents - Current Incidents) / Previous Incidents × 100' },
                departmentName: 'الأمن والسلامة',
                target: 20,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 88, q2: 80, q3: 70 },
                justification: ''
            },
            // المطبخ
            {
                name: { ar: 'نسبة رضا الضيوف عن الطعام (90%)', en: 'Food satisfaction (90%)' },
                description: { ar: 'تقييم الضيوف لجودة الطعام المقدم', en: 'Guest ratings for culinary quality' },
                calculationMethod: { ar: 'متوسط تقييم الضيوف في استبيانات الطعام', en: 'Average food survey scores' },
                departmentName: 'المطبخ',
                target: 90,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 91, q2: 91.6, q3: 94.83 },
                justification: 'as required we have achieved 94.83% guest satisfaction in the third quarter of 2025'
            },
            // مبيعات العلاقات الحكومية
            {
                name: { ar: 'زيادة الإيرادات من القطاع الحكومي (15%)', en: 'Government sector revenue (+15%)' },
                description: { ar: 'نسبة زيادة الإيرادات من العقود الحكومية', en: 'Growth in public sector bookings' },
                calculationMethod: { ar: '(الإيرادات الفعلية - الإيرادات المخططة) / الإيرادات المخططة × 100', en: '(Current Revenue - Previous Revenue) / Previous Revenue × 100' },
                departmentName: 'مبيعات العلاقات الحكومية',
                target: 15,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 25, q2: 40, q3: 40 },
                justification: 'Q2. This quarter is quite less than previous growth due to Hajj Period.'
            },
            // الاستقبال
            {
                name: { ar: 'وقت تسجيل الوصول (أقل من 5 دقائق)', en: 'Check-in time (<5 mins)' },
                description: { ar: 'الوقت المستغرق لإتمام عملية تسجيل الوصول', en: 'Efficiency of guest registration' },
                calculationMethod: { ar: 'متوسط الوقت المسجل لتسجيل الوصول', en: 'Average check-in duration' },
                departmentName: 'الاستقبال',
                target: 5,
                unit: 'دقائق',
                measurementCycle: 'شهري',
                quarterResults: { q1: 4, q2: 5, q3: 8 },
                justification: 'The check-in time increased during the third quarter due to higher guest volumes...'
            },
            {
                name: { ar: 'نسبة رضا الضيوف (90%)', en: 'Guest satisfaction rate (90%)' },
                description: { ar: 'تقييم الضيوف لخدمات الاستقبال', en: 'Reception service ratings' },
                calculationMethod: { ar: 'متوسط تقييم الضيوف في استبيانات الاستقبال', en: 'Average survey scores' },
                departmentName: 'الاستقبال',
                target: 90,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 85, q2: 94.9, q3: 97 },
                justification: 'Guest satisfaction reached 97% during the third quarter, exceeding the target rate...'
            },
            // الجودة والتميز المؤسسي
            {
                name: { ar: 'الالتزام بمعايير ISO (100%)', en: 'ISO compliance (100%)' },
                description: { ar: 'نسبة الالتزام بمعايير الجودة الدولية', en: 'Adherence to international standards' },
                calculationMethod: { ar: '(عدد نقاط الالتزام / إجمالي النقاط المطلوبة) × 100', en: '(Compliant Items / Total Requirements) × 100' },
                departmentName: 'الجودة والتميز المؤسسي',
                target: 100,
                unit: '%',
                measurementCycle: 'نصف سنوي',
                quarterResults: { q1: 100, q2: 100, q3: 100 },
                justification: ''
            },
            // تكنولوجيا المعلومات
            {
                name: { ar: 'نسبة إكمال تحديث الأنظمة (100%)', en: 'System update completion rate (100%)' },
                description: { ar: 'نسبة إكمال تحديثات الأنظمة حسب الخطة', en: 'IT infrastructure modernization' },
                calculationMethod: { ar: '(عدد التحديثات المكتملة / إجمالي التحديثات المخطط لها) × 100', en: '(Completed Updates / Planned Updates) × 100' },
                departmentName: 'تكنولوجيا المعلومات',
                target: 100,
                unit: '%',
                measurementCycle: 'شهري',
                quarterResults: { q1: 25, q2: 50, q3: 75 },
                justification: 'This task already have been completed 95% as per first quarter...'
            },
            {
                name: { ar: 'نسبة رضا الضيوف عن Wi-Fi (90%)', en: 'Wi-Fi satisfaction (90%)' },
                description: { ar: 'تقييم الضيوف لخدمة Wi-Fi', en: 'Guest ratings for internet quality' },
                calculationMethod: { ar: 'متوسط تقييم الضيوف في استبيانات Wi-Fi', en: 'Average Wi-Fi survey scores' },
                departmentName: 'تكنولوجيا المعلومات',
                target: 90,
                unit: '%',
                measurementCycle: 'ربع سنوي',
                quarterResults: { q1: 25, q2: 50, q3: 75 },
                justification: 'This task already have been completed 95% as per first quarter...'
            }
        ];

        // استيراد مؤشرات الأداء
        for (const kpiData of kpisData) {
            try {
                // البحث عن الإدارة المرتبطة
                const department = await Department.findOne({
                    $or: [
                        { 'name.ar': kpiData.departmentName },
                        { 'name.en': kpiData.departmentName }
                    ]
                });

                if (!department) {
                    console.log(`❌ Department not found: ${kpiData.departmentName}`);
                    continue;
                }

                // التحقق من عدم وجود مؤشر مكرر
                const existingKPI = await KPI.findOne({
                    'name.ar': kpiData.name.ar,
                    department: department._id
                });

                if (existingKPI) {
                    console.log(`⚠️ KPI already exists: ${kpiData.name.ar}`);
                    continue;
                }

                // حساب التقدم بناءً على النتائج الربعية
                const latestResult = kpiData.quarterResults.q3 || kpiData.quarterResults.q2 || kpiData.quarterResults.q1 || 0;
                const progress = kpiData.target > 0 ? (latestResult / kpiData.target) * 100 : 0;

                // تحديد الحالة بناءً على التقدم
                let status = 'معلق';
                if (progress >= 100) {
                    status = 'مكتمل';
                } else if (progress > 0) {
                    status = 'في التقدم';
                }

                // إنشاء مؤشر الأداء الجديد
                const newKPI = new KPI({
                    name: kpiData.name,
                    description: kpiData.description,
                    calculationMethod: kpiData.calculationMethod,
                    department: department._id,
                    target: kpiData.target,
                    unit: kpiData.unit,
                    measurementCycle: kpiData.measurementCycle,
                    currentValue: latestResult,
                    progress: Math.min(progress, 100),
                    status: status,
                    quarterResults: kpiData.quarterResults,
                    quarterProgress: {
                        q1: kpiData.quarterResults.q1 ? (kpiData.quarterResults.q1 / kpiData.target) * 100 : 0,
                        q2: kpiData.quarterResults.q2 ? (kpiData.quarterResults.q2 / kpiData.target) * 100 : 0,
                        q3: kpiData.quarterResults.q3 ? (kpiData.quarterResults.q3 / kpiData.target) * 100 : 0,
                        q4: 0
                    },
                    justification: kpiData.justification,
                    importedFromExcel: true,
                    excelSource: 'Summary KPIs Fallow Up Update 1&2&3rd Quarter 2025.xlsx'
                });

                await newKPI.save();
                results.kpis++;
                console.log(`✅ Created KPI: ${kpiData.name.ar} for ${kpiData.departmentName}`);

            } catch (kpiError) {
                console.error(`❌ Error creating KPI ${kpiData.name.ar}:`, kpiError);
                results.errors.push({
                    type: 'kpi_creation',
                    message: `Failed to create KPI: ${kpiData.name.ar}`,
                    error: kpiError.message
                });
            }
        }

        console.log(`✅ Successfully imported ${results.kpis} KPIs`);
        
    } catch (error) {
        console.error('Error importing KPIs:', error);
        results.errors.push({
            type: 'kpis_import',
            message: error.message
        });
        throw error;
    }
}

// دالة حذف جميع البيانات الوهمية
router.post('/cleanup', async (req, res) => {
    try {
        let totalDeleted = 0;
        
        // حذف جميع الموظفين الوهميين
        const employeeResult = await Employee.deleteMany({ 
            importedFromExcel: true 
        });
        totalDeleted += employeeResult.deletedCount;
        
        // حذف جميع المشاريع الوهمية
        const projectResult = await Project.deleteMany({});
        totalDeleted += projectResult.deletedCount;
        
        // حذف جميع مؤشرات الأداء الوهمية
        const kpiResult = await KPI.deleteMany({});
        totalDeleted += kpiResult.deletedCount;
        
        // حذف جميع البلاغات الوهمية
        const reportResult = await Report.deleteMany({});
        totalDeleted += reportResult.deletedCount;
        
        console.log(`🗑️ Deleted ${totalDeleted} test records`);
        
        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&success=cleanup&deleted=' + totalDeleted);
    } catch (error) {
        console.error('Error cleaning up data:', error);
        res.redirect('/admin/import?lang=' + (req.query.lang || 'ar') + '&error=cleanup_failed');
    }
});

module.exports = router;