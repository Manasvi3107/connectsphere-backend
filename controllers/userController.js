const User = require('../models/User');

// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) return res.json([]);

    const users = await User.find({
      username: { $regex: keyword, $options: "i" },
      _id: { $ne: req.user.id }, // exclude self
    }).select("username profilePic _id");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to search users" });
  }
};


// Fetch all users except the logged-in user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name email profilePicture');
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

const updateLastActive = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { lastActive: Date.now() });
    res.json({ success: true });
  } catch (err) {
    console.error('Update Last Active Error:', err);
    res.status(500).json({ message: 'Server error updating last active' });
  }
};


// Update logged-in user's profile
const updateProfile = async (req, res) => {
  const { name, bio, profilePicture } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateLastActive,
  searchUsers,
};
