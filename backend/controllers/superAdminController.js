const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');

// Get all registration requests
exports.getAllRequests = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { restaurantName: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const requests = await RegistrationRequest.find(filter)
            .sort('-createdAt');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve a registration request
exports.approveRequest = async (req, res) => {
    try {
        const request = await RegistrationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Registration request not found' });
        }

        if (request.status === 'approved') {
            return res.status(400).json({ message: 'Request is already approved' });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email: request.email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // Create a new User account with the raw password from the request
        // We need the original password, but it's hashed in RegistrationRequest
        // So we store the hashed password directly
        const user = new User({
            name: request.ownerName,
            email: request.email,
            password: 'temp', // temporary, will be overwritten
            role: 'Admin'
        });

        // Copy the already-hashed password directly (skip the pre-save hook)
        // We need to use the raw document to set the hashed password
        await User.collection.insertOne({
            name: request.ownerName,
            email: request.email,
            password: request.password, // already hashed from RegistrationRequest
            role: 'Admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Update request status
        request.status = 'approved';
        await request.save();

        res.json({ message: 'Registration approved successfully! The restaurant can now log in.', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject a registration request
exports.rejectRequest = async (req, res) => {
    try {
        const request = await RegistrationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Registration request not found' });
        }

        if (request.status === 'rejected') {
            return res.status(400).json({ message: 'Request is already rejected' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Registration rejected.', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [total, pending, approved, rejected] = await Promise.all([
            RegistrationRequest.countDocuments(),
            RegistrationRequest.countDocuments({ status: 'pending' }),
            RegistrationRequest.countDocuments({ status: 'approved' }),
            RegistrationRequest.countDocuments({ status: 'rejected' })
        ]);

        res.json({ total, pending, approved, rejected });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
