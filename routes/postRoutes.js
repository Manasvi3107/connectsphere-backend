const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getExplorePosts,
  getUserPosts,
  createPost,
  toggleLikePost,
  addComment,
  deletePost,
  deleteComment, // ✅ Added
} = require('../controllers/postController');

router.get('/', getExplorePosts);
router.get('/my-posts', protect, getUserPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLikePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);
router.delete('/:id/comment/:commentId', protect, deleteComment); // ✅ Added

module.exports = router;
