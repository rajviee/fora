const mongoose = require('mongoose');

const taskDiscussionSchema = new mongoose.Schema({
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
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 2000
    },
    // Tagged/mentioned users
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Attachments
    attachments: [{
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        size: { type: Number },
        mimeType: { type: String },
        fileExtension: { type: String }
    }],
    // Reply to another comment
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskDiscussion',
        default: null
    },
    // Edit tracking
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

taskDiscussionSchema.index({ task: 1, createdAt: -1 });
taskDiscussionSchema.index({ task: 1, parentComment: 1 });

module.exports = mongoose.model('TaskDiscussion', taskDiscussionSchema);
