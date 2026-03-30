const express = require('express');
const router = express.Router();
const { getDailySales, getTopItems, getCancelledOrders, getRevenueByOrderType } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/daily-sales', protect, authorize('Admin', 'Manager'), getDailySales);
router.get('/top-items', protect, authorize('Admin', 'Manager'), getTopItems);
router.get('/cancelled', protect, authorize('Admin', 'Manager'), getCancelledOrders);
router.get('/revenue-by-type', protect, authorize('Admin', 'Manager'), getRevenueByOrderType);

module.exports = router;
