const LeaveRequest = require('../models/leaveRequest');
const Attendance = require('../models/attendance');
const OrganizationSettings = require('../models/organizationSettings');
const User = require('../models/user');
const Notification = require('../models/notification');

// Apply for leave
const applyLeave = async (req, res) => {
    try {
        const {
            leaveType,
            startDate,
            endDate,
            isHalfDay = false,
            halfDayType = null,
            reason
        } = req.body;
        const userId = req.user.id;
        const companyId = req.user.company;

        if (!startDate || !reason) {
            return res.status(400).json({ message: 'Start date and reason are required' });
        }

        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;

        // Calculate total days
        let totalDays;
        if (isHalfDay) {
            totalDays = 0.5;
        } else {
            totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Check for overlapping leave requests
        const existingLeave = await LeaveRequest.findOne({
            user: userId,
            status: { $in: ['pending', 'approved'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (existingLeave) {
            return res.status(400).json({ message: 'Leave request already exists for this period' });
        }

        const leaveRequest = await LeaveRequest.create({
            user: userId,
            company: companyId,
            leaveType,
            startDate: start,
            endDate: end,
            isHalfDay,
            halfDayType,
            totalDays,
            reason
        });

        // Notify admin/supervisor
        const user = await User.findById(userId);
        const admins = await User.find({ 
            company: companyId, 
            role: { $in: ['admin', 'supervisor'] } 
        });

        const notifications = admins.map(admin => ({
            userId: admin._id,
            senderId: userId,
            type: 'system',
            message: `${user.firstName} ${user.lastName} has requested leave from ${start.toDateString()} to ${end.toDateString()}`,
            company: companyId
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            leaveRequest
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get leave requests
const getLeaveRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.company;
        const { status, all = false } = req.query;

        let query = { company: companyId };

        // If admin and 'all' param, show all requests
        if (req.user.role === 'admin' && all === 'true') {
            // Show all company requests
        } else {
            query.user = userId;
        }

        if (status) {
            query.status = status;
        }

        const requests = await LeaveRequest.find(query)
            .populate('user', 'firstName lastName email avatar')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get leave balance
const getLeaveBalance = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const companyId = req.user.company;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // Check access
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get organization settings for leave allowance
        const orgSettings = await OrganizationSettings.findOne({ company: companyId });
        const monthlyPaidLeaves = orgSettings?.leave?.paidLeavesPerMonth || 1.5;
        const totalAnnualLeaves = monthlyPaidLeaves * 12;

        // Get approved leaves for the year
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        const approvedLeaves = await LeaveRequest.find({
            user: userId,
            status: 'approved',
            startDate: { $gte: startOfYear, $lte: endOfYear }
        });

        let usedPaidLeaves = 0;
        let usedUnpaidLeaves = 0;
        let usedSickLeaves = 0;

        approvedLeaves.forEach(leave => {
            if (leave.leaveType === 'unpaid') {
                usedUnpaidLeaves += leave.totalDays;
            } else if (leave.leaveType === 'sick') {
                usedSickLeaves += leave.totalDays;
            } else {
                usedPaidLeaves += leave.totalDays;
            }
        });

        // Get pending requests
        const pendingRequests = await LeaveRequest.countDocuments({
            user: userId,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            balance: {
                totalAnnualLeaves,
                usedPaidLeaves,
                usedUnpaidLeaves,
                usedSickLeaves,
                remainingPaidLeaves: Math.max(0, totalAnnualLeaves - usedPaidLeaves),
                pendingRequests
            },
            year
        });
    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Approve/Reject leave (Admin/Supervisor)
const processLeaveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, rejectionReason } = req.body;
        const companyId = req.user.company;

        if (!['admin', 'supervisor'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const request = await LeaveRequest.findOne({ _id: requestId, company: companyId });
        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        if (action === 'approve') {
            request.status = 'approved';
            request.approvedBy = req.user.id;
            request.approvedAt = new Date();

            // Update attendance records for leave days
            const current = new Date(request.startDate);
            while (current <= request.endDate) {
                await Attendance.findOneAndUpdate(
                    { user: request.user, date: new Date(current.setHours(0, 0, 0, 0)) },
                    {
                        user: request.user,
                        company: companyId,
                        date: new Date(current),
                        status: 'on-leave',
                        leaveRequest: request._id
                    },
                    { upsert: true }
                );
                current.setDate(current.getDate() + 1);
            }
        } else {
            request.status = 'rejected';
            request.rejectionReason = rejectionReason;
            request.approvedBy = req.user.id;
            request.approvedAt = new Date();
        }

        await request.save();

        // Notify user
        const approver = await User.findById(req.user.id);
        await Notification.create({
            userId: request.user,
            senderId: req.user.id,
            type: 'system',
            message: `Your leave request has been ${action === 'approve' ? 'approved' : 'rejected'} by ${approver.firstName} ${approver.lastName}`,
            company: companyId
        });

        res.status(200).json({ success: true, request });
    } catch (error) {
        console.error('Process leave request error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel leave request
const cancelLeaveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;
        const companyId = req.user.company;

        const request = await LeaveRequest.findOne({
            _id: requestId,
            user: userId,
            company: companyId
        });

        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (request.status === 'cancelled') {
            return res.status(400).json({ message: 'Request already cancelled' });
        }

        // Can only cancel pending or approved (future) requests
        if (request.status === 'rejected') {
            return res.status(400).json({ message: 'Cannot cancel rejected request' });
        }

        if (request.status === 'approved' && new Date(request.startDate) <= new Date()) {
            return res.status(400).json({ message: 'Cannot cancel leave that has already started' });
        }

        request.status = 'cancelled';
        await request.save();

        // Remove attendance records if was approved
        await Attendance.deleteMany({
            user: userId,
            leaveRequest: request._id
        });

        res.status(200).json({ success: true, message: 'Leave request cancelled' });
    } catch (error) {
        console.error('Cancel leave request error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getLeaveRequests,
    getLeaveBalance,
    processLeaveRequest,
    cancelLeaveRequest
};
