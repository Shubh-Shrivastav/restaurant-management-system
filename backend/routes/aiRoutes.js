const express = require('express');
const router = express.Router();
const { getDemandPrediction } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.get('/predictions', protect, authorize('Admin', 'Manager'), getDemandPrediction);

module.exports = router;
