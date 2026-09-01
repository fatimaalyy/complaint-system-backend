const User = require('../models/Users');
const Complaint = require('../models/Complaint');
// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject pending user
// @route   PATCH /api/admin/users/:id/approval
exports.updateUserApproval = async (req, res, next) => {
  try {
    // Check if isApproved is sent in req.body, otherwise toggle or default to true
    const { isApproved } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set value explicitly or toggle if body parameter is missing
    user.isApproved = isApproved !== undefined ? isApproved : !user.isApproved;
    await user.save();

    res.status(200).json({
      message: `User approval status updated to ${user.isApproved}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or Deactivate user account
// @route   PATCH /api/admin/users/:id/status
exports.toggleUserActiveStatus = async (req, res, next) => {
  const { isActive } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ 
      message: `User account active status updated to ${isActive}`, 
      user 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role (Manage User Roles)
// @route   PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  try {
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either USER or ADMIN' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent an admin from demoting themselves and losing admin access by accident
    if (user._id.toString() === req.user.id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'You cannot change your own admin role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Delete user and their complaints (Admin Only)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Optional: User ki saari complaints bhi delete karne ke liye
    await Complaint.deleteMany({ user: req.params.id });

    // User delete karein
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and associated complaints deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
