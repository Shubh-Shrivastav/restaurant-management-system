const express = require('express');
const router = express.Router();
const { login, register, getMe, getUsers, registerRestaurant } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', protect, authorize('Admin'), register);
router.post('/register-restaurant', registerRestaurant);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin', 'Manager'), getUsers);

module.exports = router;

