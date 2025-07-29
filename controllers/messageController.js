const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, content, attachments } = req.body;

  if (!receiverId || (!content && (!attachments || attachments.length === 0))) {
    return res.status(400).json({ message: 'Message content or attachments required' });
  }

  try {
    let newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      attachments,
    });

    newMessage = await newMessage.populate('sender', 'name profilePicture');
    newMessage = await newMessage.populate('receiver', 'name profilePicture');

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('❌ Send Message Error:', err.message);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.edited = true;
    await message.save();

    res.json({ success: true, message: 'Message updated successfully', data: message });
  } catch (err) {
    console.error('Edit Message Error:', err);
    res.status(500).json({ message: 'Server error editing message' });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.read = true;
    await message.save();

    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark As Read Error:', err);
    res.status(500).json({ message: 'Server error marking as read' });
  }
};


// ✅ Get all chat users for the logged-in user
exports.getChats = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    const chatUsersMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === req.user._id.toString()
          ? msg.receiver
          : msg.sender;

      if (!chatUsersMap.has(otherUser._id.toString())) {
        chatUsersMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
      }
    });

    const chatUsers = Array.from(chatUsersMap.values());
    res.status(200).json(chatUsers);
  } catch (err) {
    console.error('❌ Fetch Chat Users Error:', err.message);
    res.status(500).json({ message: 'Server error while fetching chats' });
  }
};

// ✅ Get messages with a specific user
exports.getMessagesWithUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Fetch Messages With User Error:', err.message);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};
