const express = require('express');
const router = express.Router();
const {
    getAllRequests,
    approveRequest,
    rejectRequest,
    getDashboardStats
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require SuperAdmin role
router.use(protect, authorize('SuperAdmin'));

router.get('/requests', getAllRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);
router.get('/stats', getDashboardStats);

module.exports = router;
