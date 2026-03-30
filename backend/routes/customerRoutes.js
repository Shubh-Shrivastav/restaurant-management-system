const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerOrders, addLoyaltyPoints } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomer);
router.post('/', protect, authorize('Admin', 'Manager', 'Cashier'), createCustomer);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateCustomer);
router.delete('/:id', protect, authorize('Admin'), deleteCustomer);
router.get('/:id/orders', protect, getCustomerOrders);
router.patch('/:id/loyalty', protect, authorize('Admin', 'Manager', 'Cashier'), addLoyaltyPoints);

module.exports = router;
