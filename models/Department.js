const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: [true, 'اسم الإدارة بالعربية مطلوب'],
            trim: true
        },
        en: {
            type: String,
            required: [true, 'اسم الإدارة بالإنجليزية مطلوب'],
            trim: true
        }
    },
    description: {
        type: String,
        trim: true
    },
    manager: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    extension: {
        type: String,
        trim: true
    },
    budget: {
        type: Number,
        default: 0
    },
    actualCount: {
        type: Number,
        default: 0
    },
    variance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// إضافة فهرس للبحث
departmentSchema.index({ 'name.ar': 1, 'name.en': 1 });

module.exports = mongoose.model('Department', departmentSchema);