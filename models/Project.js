const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: [true, 'اسم المشروع بالعربية مطلوب'],
            trim: true
        },
        en: {
            type: String,
            required: [true, 'اسم المشروع بالإنجليزية مطلوب'],
            trim: true
        }
    },
    description: {
        type: String,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    deadline: {
        type: Date
    },
    budget: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    tasks: [{
        description: String,
        completed: {
            type: Boolean,
            default: false
        },
        dueDate: Date
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);