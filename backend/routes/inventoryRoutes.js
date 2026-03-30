const express = require('express');
const router = express.Router();
const { getInventory, getInventoryItem, createInventoryItem, updateInventoryItem, deleteInventoryItem, restockItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getInventory);
router.get('/:id', protect, getInventoryItem);
router.post('/', protect, authorize('Admin', 'Manager'), createInventoryItem);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateInventoryItem);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteInventoryItem);
router.patch('/:id/restock', protect, authorize('Admin', 'Manager'), restockItem);

module.exports = router;
