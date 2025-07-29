const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

// Add comment to a post
router.post('/:postId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      userName: req.user.name,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments.user', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
