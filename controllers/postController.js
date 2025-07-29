const Post = require('../models/Post');

// 🔒 Get posts of logged-in user
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    const postsWithCounts = posts.map((p) => ({
      ...p.toObject(),
      likeCount: p.likes?.length || 0,
      commentCount: p.comments?.length || 0,
    }));

    res.status(200).json(postsWithCounts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🌍 Get posts for Explore Feed (supports pagination)
const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture') // ✅ Populate commenter details
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const postsWithCounts = posts.map((p) => ({
      ...p.toObject(),
      likeCount: p.likes?.length || 0,
      commentCount: p.comments?.length || 0,
    }));

    res.status(200).json(postsWithCounts);
  } catch (err) {
    console.error('Error fetching explore posts:', err);
    res.status(500).json({ message: 'Failed to fetch explore posts' });
  }
};

// ✍️ Create a new post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res.status(400).json({ message: 'Post content or image is required' });
    }

    const newPost = new Post({
      user: req.user._id,
      content,
      image,
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      ...savedPost.toObject(),
      likeCount: 0,
      commentCount: 0,
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ❤️ Like/Unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 💬 Add a comment to a post
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comments: updatedPost.comments,
    });
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// 🗑️ Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🗑️ Delete a comment
// 🗑️ Delete a comment
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Find the comment
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the current user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    comment.deleteOne(); // ✅ This is better than comment.remove()
    await post.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Failed to delete comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};


module.exports = {
  getUserPosts,
  getExplorePosts,
  createPost,
  toggleLikePost,
  addComment,
  deletePost,
  deleteComment, // ✅ Added
};
