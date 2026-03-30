const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { owner: req.user._id };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const customers = await Customer.find(query).sort('-lastVisit');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, owner: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const existing = await Customer.findOne({ phone: req.body.phone, owner: req.user._id });
        if (existing) return res.status(400).json({ message: 'Customer with this phone already exists' });
        const customer = await Customer.create({ ...req.body, owner: req.user._id });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.params.id, owner: req.user._id }).sort('-createdAt').limit(20);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addLoyaltyPoints = async (req, res) => {
    try {
        const { points } = req.body;
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $inc: { loyaltyPoints: points } },
            { new: true }
        );
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
