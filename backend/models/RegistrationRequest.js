const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const registrationRequestSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true },
    restaurantType: {
        type: String,
        enum: ['Restaurant', 'Hotel', 'Cafe', 'Bar'],
        default: 'Restaurant'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Hash password before saving
registrationRequestSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Hide password in JSON responses
registrationRequestSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('RegistrationRequest', registrationRequestSchema);
