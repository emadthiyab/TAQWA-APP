const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: [true, 'اسم الموظف بالعربية مطلوب'],
            trim: true
        },
        en: {
            type: String,
            required: [true, 'اسم الموظف بالإنجليزية مطلوب'],
            trim: true
        }
    },
    employeeId: {
        type: String,
        unique: true,
        trim: true
    },
    position: {
        ar: {
            type: String,
            required: [true, 'المسمى الوظيفي بالعربية مطلوب'],
            trim: true
        },
        en: {
            type: String,
            required: [true, 'المسمى الوظيفي بالإنجليزية مطلوب'],
            trim: true
        }
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
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
    hireDate: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        default: 0
    },
    tasks: [{
        description: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    tcNumber: {
        type: String,
        trim: true
    },
    importedFromExcel: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// إنشاء employeeId تلقائياً إذا لم يتم توفيره
employeeSchema.pre('save', function(next) {
    if (!this.employeeId) {
        this.employeeId = `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);