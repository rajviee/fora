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

// Admin routes
router.get('/daily', getDailyAttendance);
router.get('/analytics/:userId', getEmployeeAnalytics);

module.exports = router;
