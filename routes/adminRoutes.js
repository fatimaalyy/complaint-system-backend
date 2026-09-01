const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserApproval, toggleUserActiveStatus, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Secure all admin routes with protect + adminOnly
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.patch('/users/:id/approval', updateUserApproval);
router.patch('/users/:id/status', toggleUserActiveStatus);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;