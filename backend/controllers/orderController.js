const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');

exports.createOrder = async (req, res) => {
    try {
        const orderData = { ...req.body };

        // Determine the owner: authenticated user or adminId from QR order
        let ownerId;
        if (req.user) {
            ownerId = req.user._id;
            orderData.createdBy = req.user._id;
        } else if (req.body.adminId) {
            ownerId = req.body.adminId;
        } else {
            return res.status(400).json({ message: 'Order must be associated with a restaurant (missing adminId)' });
        }
        orderData.owner = ownerId;

        // Remove adminId from saved data (it's not in the schema)
        delete orderData.adminId;

        // Calculate totals
        let subtotal = 0;
        orderData.items.forEach(item => {
            const toppingsTotal = (item.toppings || []).reduce((sum, t) => sum + (t.price || 0), 0);
            item.itemTotal = (item.price + toppingsTotal) * item.quantity;
            subtotal += item.itemTotal;
        });
        orderData.subtotal = subtotal;
        orderData.tax = Math.round(subtotal * 0.05 * 100) / 100;
        orderData.total = orderData.subtotal + orderData.tax - (orderData.discount || 0);

        const order = await Order.create(orderData);

        // Deduct inventory (only for items owned by this restaurant)
        for (const item of orderData.items) {
            const menuItem = await MenuItem.findOne({ _id: item.menuItem, owner: ownerId }).populate('ingredients.inventoryItem');
            if (menuItem && menuItem.ingredients) {
                for (const ing of menuItem.ingredients) {
                    if (ing.inventoryItem) {
                        await Inventory.findOneAndUpdate(
                            { _id: ing.inventoryItem._id || ing.inventoryItem, owner: ownerId },
                            { $inc: { quantity: -(ing.quantityUsed * item.quantity) } }
                        );
                    }
                }
            }
        }

        // Auto-create or update customer from order data
        if (orderData.customer) {
            // If an existing customer ID is linked, update their stats
            await Customer.findOneAndUpdate(
                { _id: orderData.customer, owner: ownerId },
                {
                    $inc: { totalOrders: 1, totalSpent: orderData.total, loyaltyPoints: Math.floor(orderData.total / 10) },
                    lastVisit: new Date()
                }
            );
        } else if (orderData.customerName && orderData.customerName !== 'Walk-in') {
            // Auto-create or find customer by phone (scoped to this owner)
            let customer = null;
            if (orderData.customerPhone) {
                customer = await Customer.findOne({ phone: orderData.customerPhone, owner: ownerId });
            }

            if (customer) {
                // Update existing customer stats
                customer.totalOrders += 1;
                customer.totalSpent += orderData.total;
                customer.loyaltyPoints += Math.floor(orderData.total / 10);
                customer.lastVisit = new Date();
                if (orderData.customerName) customer.name = orderData.customerName;
                await customer.save();
                order.customer = customer._id;
                await order.save();
            } else {
                // Create a new customer record scoped to this owner
                const newCustomer = await Customer.create({
                    owner: ownerId,
                    name: orderData.customerName,
                    phone: orderData.customerPhone || `walk-${Date.now()}`,
                    email: orderData.customerEmail || '',
                    totalOrders: 1,
                    totalSpent: orderData.total,
                    loyaltyPoints: Math.floor(orderData.total / 10),
                    lastVisit: new Date()
                });
                order.customer = newCustomer._id;
                await order.save();
            }
        }

        // Emit socket event for kitchen (scoped to owner)
        const io = req.app.get('io');
        if (io) {
            const populatedOrder = await Order.findById(order._id).populate('createdBy', 'name');
            io.to(`kitchen-${ownerId}`).emit('new-order', populatedOrder);
            io.to(`dashboard-${ownerId}`).emit('new-order', populatedOrder);
            // Also emit to generic rooms for backward compatibility
            io.to('kitchen').emit('new-order', populatedOrder);
            io.to('dashboard').emit('new-order', populatedOrder);
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { status, orderType, date, limit = 50 } = req.query;
        let query = { owner: req.user._id };
        if (status) query.status = status;
        if (orderType) query.orderType = orderType;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }
        const orders = await Order.find(query)
            .populate('createdBy', 'name')
            .sort('-createdAt')
            .limit(parseInt(limit));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, owner: req.user._id })
            .populate('createdBy', 'name')
            .populate('customer', 'name phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { status },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const io = req.app.get('io');
        if (io) {
            io.to(`kitchen-${req.user._id}`).emit('order-updated', order);
            io.to(`dashboard-${req.user._id}`).emit('order-updated', order);
            io.to('kitchen').emit('order-updated', order);
            io.to('dashboard').emit('order-updated', order);
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getActiveOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            owner: req.user._id,
            status: { $in: ['Pending', 'Preparing', 'Ready'] }
        }).populate('createdBy', 'name').sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
