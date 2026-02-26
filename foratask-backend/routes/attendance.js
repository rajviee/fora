const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getTodayStatus,
    getAttendanceHistory,
    getDailyAttendance,
    getEmployeeAnalytics
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Employee attendance
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/history', getAttendanceHistory);
router.get('/history/:userId', getAttendanceHistory);

// Monthly stats
router.get('/monthly-stats', async (req, res) => {
    try {
        const Attendance = require('../models/attendance');
        const OrganizationSettings = require('../models/organizationSettings');
        
        const { month } = req.query;
        const userId = req.user.id;
        const companyId = req.user.company;
        
        const [year, monthNum] = month ? month.split('-') : [new Date().getFullYear(), new Date().getMonth() + 1];
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);
        
        const records = await Attendance.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        });
        
        // Get org settings for working days
        const orgSettings = await OrganizationSettings.findOne({ company: companyId });
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        let workingDays = 0;
        let currentDate = new Date(startDate);
        const today = new Date();
        
        while (currentDate <= endDate && currentDate <= today) {
            const dayName = dayMap[currentDate.getDay()];
            if (orgSettings?.workingDays?.[dayName]) {
                workingDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const presentDays = records.filter(r => r.status === 'present').length;
        const leavesTaken = records.filter(r => r.status === 'leave').length;
        const absentDays = Math.max(0, workingDays - presentDays - leavesTaken);
        
        res.json({
            workingDays,
            presentDays,
            absentDays,
            leavesTaken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin routes
router.get('/daily', getDailyAttendance);
router.get('/analytics/:userId', getEmployeeAnalytics);

module.exports = router;
