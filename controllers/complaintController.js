const Complaint = require('../models/Complaint');
const User = require('../models/Users');

// @desc    Create new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      user: req.user.id || req.user._id
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Logged-in User Complaints
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with Search & Filter (Admin Only)
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by id (View Details)
// @route   GET /api/complaints/:id
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // A normal user can only view their own complaint; admin can view any
    const isOwner = complaint.user._id.toString() === (req.user.id || req.user._id).toString();
    if (req.user.role !== 'ADMIN' && !isOwner) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & remark (Admin Only)
// @route   PATCH /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminRemark } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminRemark !== undefined) complaint.adminRemark = adminRemark;

    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (User can update if status is Pending)
// @route   PUT /api/complaints/:id
exports.updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot edit processed complaints' });
    }

    complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (User can delete if status is Pending)
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete processed complaints' });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system stats for Admin Dashboard
// @route   GET /api/complaints/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    res.status(200).json({
      success: true,
      stats: { totalComplaints, pending, inProgress, resolved, rejected }
    });
  } catch (error) {
    next(error);
  }
};