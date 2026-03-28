const express = require('express');
const router = express.Router();
const { getDailyReportData, generateDailyReportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/daily', protect, getDailyReportData);
router.get('/daily/pdf', protect, generateDailyReportPDF);

module.exports = router;
