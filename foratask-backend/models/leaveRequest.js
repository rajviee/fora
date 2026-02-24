const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['paid', 'unpaid', 'sick', 'casual', 'earned'],
        default: 'paid'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Half day support
    isHalfDay: {
        type: Boolean,
        default: false
    },
    halfDayType: {
        type: String,
        enum: ['first-half', 'second-half', null],
        default: null
    },
    // Total days
    totalDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxLength: 500
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    // Approval
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    // Attachments (medical certificates etc.)
    attachments: [{
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        size: { type: Number },
        mimeType: { type: String }
    }]
}, {
    timestamps: true
});

leaveRequestSchema.index({ user: 1, status: 1 });
leaveRequestSchema.index({ company: 1, status: 1 });
leaveRequestSchema.index({ user: 1, startDate: 1, endDate: 1 });

// Calculate total days (excluding weekends if needed)
leaveRequestSchema.methods.calculateTotalDays = function() {
    if (this.isHalfDay) return 0.5;
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    let days = 0;
    
    while (start <= end) {
        days++;
        start.setDate(start.getDate() + 1);
    }
    
    return days;
};

// Get leave balance
leaveRequestSchema.statics.getLeaveBalance = async function(userId, year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    
    const approvedLeaves = await this.find({
        user: userId,
        status: 'approved',
        startDate: { $gte: startOfYear, $lte: endOfYear }
    });
    
    let usedPaidLeaves = 0;
    approvedLeaves.forEach(leave => {
        if (leave.leaveType === 'paid' || leave.leaveType === 'earned' || leave.leaveType === 'casual') {
            usedPaidLeaves += leave.totalDays;
        }
    });
    
    return {
        totalPaidLeaves: 18, // Can be fetched from org settings
        usedPaidLeaves,
        remainingPaidLeaves: Math.max(0, 18 - usedPaidLeaves)
    };
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
