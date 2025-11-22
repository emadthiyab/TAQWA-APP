const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    titleEn: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['شكوى', 'أعطال', 'احتياجات', 'استفسار', 'مقترح'],
        required: true
    },
    typeEn: {
        type: String,
        enum: ['Complaint', 'Malfunction', 'Needs', 'Inquiry', 'Suggestion'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    status: {
        type: String,
        enum: ['جاري التنفيذ', 'مكتمل', 'معلق'],
        default: 'جاري التنفيذ'
    },
    statusEn: {
        type: String,
        enum: ['In Progress', 'Completed', 'Pending'],
        default: 'In Progress'
    },
    priority: {
        type: String,
        enum: ['عالي', 'متوسط', 'منخفض'],
        default: 'متوسط'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    response: String,
    responseDate: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    dueDate: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from creation
    }
}, {
    timestamps: true
});

// Auto-update status based on due date
reportSchema.pre('save', function(next) {
    const now = new Date();
    if (this.status === 'جاري التنفيذ' && this.dueDate && now > this.dueDate) {
        this.status = 'معلق';
        this.statusEn = 'Pending';
    }
    next();
});

module.exports = mongoose.model('Report', reportSchema);