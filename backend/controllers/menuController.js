const MenuItem = require('../models/MenuItem');
const path = require('path');

exports.getMenuItems = async (req, res) => {
    try {
        const { category, search, available, adminId } = req.query;
        let query = {};

        // Determine owner scope: authenticated user or adminId from QR
        if (req.user) {
            query.owner = req.user._id;
        } else if (adminId) {
            query.owner = adminId;
        }
        // If neither, return empty (shouldn't happen in practice)

        if (category) query.category = category;
        if (available !== undefined) query.isAvailable = available === 'true';
        if (search) query.name = { $regex: search, $options: 'i' };
        const items = await MenuItem.find(query).populate('ingredients.inventoryItem', 'name unit quantity').sort('category name');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMenuItem = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        // For public access (QR), allow fetching by adminId query param
        if (req.user) {
            query.owner = req.user._id;
        } else if (req.query.adminId) {
            query.owner = req.query.adminId;
        }
        const item = await MenuItem.findOne(query).populate('ingredients.inventoryItem', 'name unit quantity');
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const data = { ...req.body, owner: req.user._id };
        if (req.file) {
            data.image = `/uploads/${req.file.filename}`;
        }
        if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
        if (typeof data.toppings === 'string') data.toppings = JSON.parse(data.toppings);
        if (typeof data.ingredients === 'string') data.ingredients = JSON.parse(data.ingredients);
        const item = await MenuItem.create(data);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = `/uploads/${req.file.filename}`;
        }
        if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
        if (typeof data.toppings === 'string') data.toppings = JSON.parse(data.toppings);
        if (typeof data.ingredients === 'string') data.ingredients = JSON.parse(data.ingredients);
        const item = await MenuItem.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            data,
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
