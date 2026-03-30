const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.getDemandPrediction = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user._id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Analyze last 30 days of orders (scoped by owner)
        const itemAnalysis = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalOrdered: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.itemTotal' },
                    orderCount: { $sum: 1 },
                    avgQuantityPerOrder: { $avg: '$items.quantity' }
                }
            },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 }
        ]);

        // Day of week analysis (scoped by owner)
        const dayOfWeekAnalysis = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    avgOrders: { $sum: 1 },
                    avgRevenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Peak hours analysis (scoped by owner)
        const hourlyAnalysis = await Order.aggregate([
            {
                $match: {
                    owner: ownerId,
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orderCount: { $sum: 1 },
                    avgRevenue: { $avg: '$total' }
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: 5 }
        ]);

        // Tomorrow's prediction based on same day of week trends
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDow = tomorrow.getDay() + 1;

        const tomorrowPrediction = dayOfWeekAnalysis.find(d => d._id === tomorrowDow);
        const weeksInRange = 4;

        const predictions = {
            topItems: itemAnalysis.map(item => ({
                name: item._id,
                predictedDemand: Math.round(item.totalOrdered / 30),
                avgQuantityPerOrder: Math.round(item.avgQuantityPerOrder * 10) / 10,
                last30DaysTotal: item.totalOrdered,
                revenue: item.totalRevenue
            })),
            tomorrowPrediction: tomorrowPrediction ? {
                expectedOrders: Math.round(tomorrowPrediction.avgOrders / weeksInRange),
                expectedRevenue: Math.round(tomorrowPrediction.avgRevenue / weeksInRange)
            } : { expectedOrders: 0, expectedRevenue: 0 },
            peakHours: hourlyAnalysis.map(h => ({
                hour: h._id,
                label: `${h._id}:00 - ${h._id + 1}:00`,
                orderCount: h.orderCount,
                avgRevenue: Math.round(h.avgRevenue)
            })),
            dayOfWeekTrends: dayOfWeekAnalysis.map(d => {
                const days = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return {
                    day: days[d._id],
                    orders: Math.round(d.avgOrders / weeksInRange),
                    revenue: Math.round(d.avgRevenue / weeksInRange)
                };
            })
        };

        res.json(predictions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
