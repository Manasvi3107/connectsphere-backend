const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChats,
  getMessagesWithUser,
  editMessage,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const Message = require('../models/Message');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// DEBUG: Test route
router.get('/test', (req, res) => {
  console.log('✅ /api/messages/test route hit');
  res.json({ message: 'Test route working' });
});

// POST: Send message
router.post('/', protect, upload.array('attachments'), sendMessage);

// GET: Get all chats
router.get('/', protect, getChats);

// GET: Get messages with a specific user
router.get('/:userId', protect, getMessagesWithUser);

// PATCH: Edit message
router.patch('/:id', protect, editMessage);

// PATCH: Mark as read
router.patch('/:id/read', protect, markAsRead);

// DELETE: Delete message
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting message" });
  }
});

module.exports = router;
