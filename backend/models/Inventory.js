const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['Vegetables', 'Dairy', 'Spices', 'Grains', 'Meat', 'Beverages', 'Packaging', 'Other'],
        default: 'Other'
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: {
        type: String,
        enum: ['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box'],
        default: 'kg'
    },
    costPerUnit: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    supplier: { type: String, default: '' },
    lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

inventorySchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.lowStockThreshold;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
