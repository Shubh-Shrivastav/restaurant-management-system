const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's sales (scoped by owner)
        const todaySales = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: today, $lt: tomorrow },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Total orders today by status (scoped by owner)
        const ordersByStatus = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Low stock items (scoped by owner)
        const allInventory = await Inventory.find({ owner: req.user._id });
        const lowStockItems = allInventory.filter(item => item.isLowStock);

        // Recent orders (scoped by owner)
        const recentOrders = await Order.find({ owner: req.user._id })
            .sort('-createdAt')
            .limit(5)
            .populate('createdBy', 'name');

        // Pending orders count (scoped by owner)
        const pendingOrders = await Order.countDocuments({
            owner: req.user._id,
            status: { $in: ['Pending', 'Preparing'] }
        });

        res.json({
            todaySales: todaySales[0] || { totalSales: 0, orderCount: 0 },
            ordersByStatus,
            lowStockItems,
            lowStockCount: lowStockItems.length,
            recentOrders,
            pendingOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
