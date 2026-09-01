const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  getAdminStats,
} = require('../controllers/complaintController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public/User Routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin Only Routes (kept above '/:id' so they don't get swallowed by the param route)
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/', protect, adminOnly, getAllComplaints);

// View single complaint (owner or admin)
router.get('/:id', protect, getComplaintById);

// User Edit & Delete Routes
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

router.patch('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;