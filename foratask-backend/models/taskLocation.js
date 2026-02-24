const mongoose = require('mongoose');

const taskLocationSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    // Location details
    name: {
        type: String,
        required: true,
        maxLength: 200
    },
    description: {
        type: String,
        maxLength: 1000
    },
    address: {
        type: String,
        maxLength: 500
    },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    // Order/sequence (optional)
    sequence: {
        type: Number,
        default: 0
    },
    // Status per location
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Skipped'],
        default: 'Pending'
    },
    // Progress updates for this location
    progressUpdates: [{
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Skipped']
        },
        remarks: { type: String, maxLength: 500 },
        geotag: {
            coordinates: {
                latitude: { type: Number },
                longitude: { type: Number }
            },
            accuracy: { type: Number },
            address: { type: String }
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: { type: Date, default: Date.now },
        attachments: [{
            filename: { type: String },
            originalName: { type: String },
            path: { type: String },
            size: { type: Number },
            mimeType: { type: String }
        }]
    }],
    // Viewer approval
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    // Timestamps
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

taskLocationSchema.index({ task: 1, sequence: 1 });

module.exports = mongoose.model('TaskLocation', taskLocationSchema);
