const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getLeaveRequests,
    getLeaveBalance,
    processLeaveRequest,
    cancelLeaveRequest
} = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

// Leave requests
router.post('/apply', upload.array('file', 3), applyLeave);
router.get('/requests', getLeaveRequests);
router.get('/balance', getLeaveBalance);
router.get('/balance/:userId', getLeaveBalance);

// Admin actions
router.patch('/requests/:requestId', processLeaveRequest);
router.delete('/requests/:requestId', cancelLeaveRequest);

module.exports = router;
