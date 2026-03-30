const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes use optionalAuth - if token exists, use it; otherwise use adminId query param
router.get('/', optionalAuth, getMenuItems);
router.get('/:id', optionalAuth, getMenuItem);

// Protected routes for admin operations
router.post('/', protect, authorize('Admin', 'Manager'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('Admin', 'Manager'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteMenuItem);

module.exports = router;
