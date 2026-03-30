const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    variant: { type: String, default: '' },
    toppings: [{ name: String, price: Number }],
    itemTotal: { type: Number, required: true },
    notes: { type: String, default: '' }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderNumber: { type: String, unique: true },
    orderType: {
        type: String,
        enum: ['Dine In', 'Takeaway', 'Delivery'],
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    tableNumber: { type: String, default: '' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: 'Walk-in' },
    customerPhone: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Online'],
        default: 'Cash'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isQrOrder: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
