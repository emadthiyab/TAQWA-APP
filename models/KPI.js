const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
    name: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    description: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
    },
    calculationMethod: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    target: { type: Number, required: true },
    unit: { type: String, default: '%' },
    measurementCycle: {
        type: String,
        enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'],
        default: 'شهري'
    },
    currentValue: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['متأخر', 'في التقدم', 'مكتمل', 'معلق'],
        default: 'معلق'
    },
    quarterResults: {
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 },
        q4: { type: Number, default: 0 }
    },
    quarterProgress: {
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 },
        q4: { type: Number, default: 0 }
    },
    justification: { type: String, default: '' },
    importedFromExcel: { type: Boolean, default: false },
    excelSource: { type: String, default: '' }
}, {
    timestamps: true
});

// مؤشرات نصية للبحث
kpiSchema.index({ 
    'name.ar': 'text', 
    'name.en': 'text',
    'description.ar': 'text',
    'description.en': 'text'
});

module.exports = mongoose.model('KPI', kpiSchema);