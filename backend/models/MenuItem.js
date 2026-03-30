const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
}, { _id: true });

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
}, { _id: true });

const menuItemSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
        type: String,
        required: true,
        enum: ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Breads', 'Rice', 'Combo']
    },
    price: { type: Number, required: true },
    variants: [variantSchema],
    toppings: [toppingSchema],
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 },
    ingredients: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        quantityUsed: { type: Number, default: 1 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
