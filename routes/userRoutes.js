const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Route to get logged-in user's profile
router.get('/me', protect, getProfile);

// Route to update logged-in user's profile
router.put('/me', protect, updateProfile);

// Route to get all users except the logged-in user
router.get('/', protect, getAllUsers);
router.get('/search', authenticateUser, searchUsers);

// ✅ Follow a user
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow.followers.includes(req.user._id)) {
      userToFollow.followers.push(req.user._id);
      currentUser.following.push(req.params.id);

      await userToFollow.save();
      await currentUser.save();

      res.status(200).json({ message: 'User has been followed' });
    } else {
      res.status(400).json({ message: 'You already follow this user' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Unfollow a user
router.put('/:id/unfollow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (userToUnfollow.followers.includes(req.user._id)) {
      userToUnfollow.followers.pull(req.user._id);
      currentUser.following.pull(req.params.id);

      await userToUnfollow.save();
      await currentUser.save();

      res.status(200).json({ message: 'User has been unfollowed' });
    } else {
      res.status(400).json({ message: 'You don’t follow this user' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
