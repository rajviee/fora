const express = require('express');
const router = express.Router();
const {
    getSalaryConfig,
    upsertSalaryConfig,
    generateSalaryRecord,
    getSalaryRecords,
    markAsPaid,
    getMonthlyPayroll
} = require('../controllers/salaryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Salary configuration
router.get('/config/:userId', getSalaryConfig);
router.put('/config/:userId', upsertSalaryConfig);

// Salary records
router.post('/generate/:userId', generateSalaryRecord);
router.get('/records/:userId', getSalaryRecords);
router.patch('/records/:recordId/pay', markAsPaid);

// Payroll
router.get('/payroll', getMonthlyPayroll);

module.exports = router;
