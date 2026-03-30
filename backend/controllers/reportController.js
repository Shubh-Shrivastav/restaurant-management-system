const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.getDailySales = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        startDate.setHours(0, 0, 0, 0);

        const sales = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: startDate },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalSales: { $sum: '$total' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTopItems = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const topItems = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: startDate },
                    status: { $ne: 'Cancelled' }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.itemTotal' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        res.json(topItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCancelledOrders = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const cancelled = await Order.find({
            owner: req.user._id,
            status: 'Cancelled',
            createdAt: { $gte: startDate }
        }).sort('-createdAt').limit(50);

        const stats = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        res.json({ cancelled, stats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getRevenueByOrderType = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const revenue = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: startDate },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: '$orderType',
                    totalRevenue: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
