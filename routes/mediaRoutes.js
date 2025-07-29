const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChats,
  getMessagesWithUser,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// POST: Send a message
router.post('/', protect, sendMessage);

// GET: Get all chats for logged-in user
router.get('/', protect, getChats);

// GET: Get messages with a specific user
router.get('/:userId', protect, getMessagesWithUser);

module.exports = router;
