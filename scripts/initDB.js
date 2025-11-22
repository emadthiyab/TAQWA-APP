const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Department = require('../models/Department');

const initDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        // Clear existing data
        await Department.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Create default departments
        const departments = await Department.insertMany([
            {
                name: {
                    ar: 'الإدارة العامة',
                    en: 'General Management'
                },
                description: 'الإدارة العليا للفندق',
                descriptionEn: 'Hotel top management'
            }
        ]);

        // Create default admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@taqwahotel.com',
            password: 'admin123',
            fullName: 'مدير النظام',
            fullNameEn: 'System Administrator',
            department: departments[0]._id,
            role: 'مدير',
            roleEn: 'Admin',
            phone: '+966500000000'
        });

        await adminUser.save();

        console.log('✅ Database initialized successfully');
        console.log('👤 Admin credentials: admin / admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDatabase();