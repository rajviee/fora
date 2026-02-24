const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    addOfficeLocation,
    updateOfficeLocation,
    deleteOfficeLocation,
    addHoliday,
    deleteHoliday,
    getUpcomingHolidays
} = require('../controllers/organizationSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Settings
router.get('/', getSettings);
router.patch('/', updateSettings);

// Office locations
router.post('/locations', addOfficeLocation);
router.patch('/locations/:locationId', updateOfficeLocation);
router.delete('/locations/:locationId', deleteOfficeLocation);

// Holidays
router.get('/holidays/upcoming', getUpcomingHolidays);
router.post('/holidays', addHoliday);
router.delete('/holidays/:holidayId', deleteHoliday);

module.exports = router;
