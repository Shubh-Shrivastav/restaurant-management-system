const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, role });
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.registerRestaurant = async (req, res) => {
    try {
        const { restaurantName, ownerName, email, password, phone, restaurantType } = req.body;

        if (!restaurantName || !ownerName || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if email already exists in Users
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Check if a registration request already exists
        const existingRequest = await RegistrationRequest.findOne({ email });
        if (existingRequest) {
            return res.status(400).json({
                message: `A registration request with this email already exists (status: ${existingRequest.status})`
            });
        }

        await RegistrationRequest.create({
            restaurantName,
            ownerName,
            email,
            password,
            phone,
            restaurantType: restaurantType || 'Restaurant'
        });

        res.status(201).json({
            message: 'Registration submitted successfully! Please wait for admin approval before logging in.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
