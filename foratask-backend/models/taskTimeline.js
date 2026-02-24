const mongoose = require('mongoose');

const taskTimelineSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    eventType: {
        type: String,
        enum: [
            'task_created',
            'task_assigned',
            'status_change',
            'location_update',
            'location_started',
            'location_completed',
            'attendance_marked',
            'geotag_captured',
            'comment_added',
            'file_uploaded',
            'approval_requested',
            'approval_granted',
            'approval_rejected',
            'task_completed',
            'task_reopened',
            'priority_changed',
            'due_date_changed',
            'assignee_changed',
            'observer_changed'
        ],
        required: true
    },
    // Actor who performed the action
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Event details
    details: {
        // Status changes
        previousStatus: { type: String },
        newStatus: { type: String },
        // Location updates
        locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskLocation' },
        locationName: { type: String },
        // Geotag
        geotag: {
            coordinates: {
                latitude: { type: Number },
                longitude: { type: Number }
            },
            accuracy: { type: Number },
            address: { type: String }
        },
        // Remarks
        remarks: { type: String },
        // Attendance reference
        attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
        // Assignment changes
        addedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        removedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        // Priority/Date changes
        previousValue: { type: String },
        newValue: { type: String },
        // File info
        fileName: { type: String },
        // Comment reference
        commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskDiscussion' }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

taskTimelineSchema.index({ task: 1, timestamp: -1 });
taskTimelineSchema.index({ company: 1, task: 1 });

// Static method to add timeline entry
taskTimelineSchema.statics.addEntry = async function(taskId, companyId, eventType, performedBy, details = {}) {
    return await this.create({
        task: taskId,
        company: companyId,
        eventType,
        performedBy,
        details,
        timestamp: new Date()
    });
};

module.exports = mongoose.model('TaskTimeline', taskTimelineSchema);
