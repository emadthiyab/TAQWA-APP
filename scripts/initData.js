const initData = async () => {
    try {
        console.log('🔄 Starting database initialization...');
        
        // استيراد دالة تهيئة معايير التقييم
        const initEvaluationData = require('./initEvaluationData');
        
        // 1. إنشاء الإدارات الأساسية
        await createBasicDepartments();
        
        // 2. إنشاء المستخدمين الأساسيين
        await createBasicUsers();
        
        // 3. إنشاء معايير التقييم الأساسية
        await initEvaluationData();
        
        console.log('✅ Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};

module.exports = initData;