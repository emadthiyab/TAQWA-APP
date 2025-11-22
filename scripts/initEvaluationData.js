const mongoose = require('mongoose');
const EvaluationCriteria = require('../models/EvaluationCriteria');
const User = require('../models/User');

const initEvaluationData = async () => {
    try {
        console.log('🔄 Initializing evaluation criteria...');
        
        const adminUser = await User.findOne({ role: 'مدير' });
        const createdBy = adminUser ? adminUser._id : null;
        
        const basicCriteria = [
            // معايير HOD
            {
                name: { ar: 'جودة العمل', en: 'Quality of Work' },
                description: { 
                    ar: 'دقة، شمولية، وكفاءة العمل بغض النظر عن الحجم والقدرة على تلبية المعايير', 
                    en: 'Accuracy, thoroughness, and efficiency of work regardless of volume & ability to meet standards' 
                },
                category: 'quality',
                categoryName: { ar: 'جودة العمل', en: 'Quality of Work' },
                section: 'hod',
                maxScore: 5,
                weight: 16.67,
                performanceLevels: [
                    { level: 1, name: { ar: 'لا يحقق المعايير', en: 'Does Not Achieve Standards' }, minScore: 0, maxScore: 1 },
                    { level: 2, name: { ar: 'نتائج مختلطة', en: 'Mix Outcome' }, minScore: 1.1, maxScore: 2 },
                    { level: 3, name: { ar: 'يلبي التوقعات', en: 'Meets Expectations' }, minScore: 2.1, maxScore: 3 },
                    { level: 4, name: { ar: 'ممتاز', en: 'Excellent' }, minScore: 3.1, maxScore: 4 },
                    { level: 5, name: { ar: 'أداء استثنائي', en: 'Outstanding' }, minScore: 4.1, maxScore: 5 }
                ],
                createdBy
            },
            {
                name: { ar: 'الإنتاجية والإنجاز', en: 'Productivity/Accomplishment' },
                description: { 
                    ar: 'إكمال المهام في الوقت المحدد، إظهار قدرات التخطيط للمشاريع وإدارة الوقت', 
                    en: 'Completes assignments on schedule; demonstrates project planning and time management capabilities' 
                },
                category: 'productivity',
                categoryName: { ar: 'الإنتاجية والإنجاز', en: 'Productivity/Accomplishment' },
                section: 'hod',
                maxScore: 5,
                weight: 16.67,
                performanceLevels: [
                    { level: 1, name: { ar: 'لا يحقق المعايير', en: 'Does Not Achieve Standards' }, minScore: 0, maxScore: 1 },
                    { level: 2, name: { ar: 'نتائج مختلطة', en: 'Mix Outcome' }, minScore: 1.1, maxScore: 2 },
                    { level: 3, name: { ar: 'يلبي التوقعات', en: 'Meets Expectations' }, minScore: 2.1, maxScore: 3 },
                    { level: 4, name: { ar: 'ممتاز', en: 'Excellent' }, minScore: 3.1, maxScore: 4 },
                    { level: 5, name: { ar: 'أداء استثنائي', en: 'Outstanding' }, minScore: 4.1, maxScore: 5 }
                ],
                createdBy
            }
        ];
        
        for (const criteriaData of basicCriteria) {
            const existing = await EvaluationCriteria.findOne({
                'name.ar': criteriaData.name.ar,
                category: criteriaData.category,
                section: criteriaData.section
            });
            
            if (!existing) {
                const criteria = new EvaluationCriteria(criteriaData);
                await criteria.save();
                console.log(`✅ Created criteria: ${criteriaData.name.ar}`);
            }
        }
        
        console.log('✅ Evaluation criteria initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing evaluation criteria:', error);
    }
};

module.exports = initEvaluationData;