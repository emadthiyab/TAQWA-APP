const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        
        // Load models after connection
        require('../models/User');
        require('../models/Department');
        require('../models/KPI');
        require('../models/Project');
        require('../models/Employee');
        require('../models/Report');
        require('../models/EvaluationCriteria');
        
    } catch (error) {
        console.log('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;