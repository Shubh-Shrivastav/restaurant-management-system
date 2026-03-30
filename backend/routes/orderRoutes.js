const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, getActiveOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createOrder);
router.get('/', protect, getOrders);
router.get('/active', protect, getActiveOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('Admin', 'Manager', 'Kitchen Staff', 'Cashier'), updateOrderStatus);

module.exports = router;
