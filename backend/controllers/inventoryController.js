const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
    try {
        const { category, lowStock, search } = req.query;
        let query = { owner: req.user._id };
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        let items = await Inventory.find(query).sort('category name');
        if (lowStock === 'true') {
            items = items.filter(item => item.isLowStock);
        }
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, owner: req.user._id });
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.create({ ...req.body, owner: req.user._id });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json({ message: 'Inventory item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.restockItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $inc: { quantity }, lastRestocked: new Date() },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
