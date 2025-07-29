const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    attachments: [{ type: String }], // 🆕 For file uploads
    edited: { type: Boolean, default: false }, // 🆕 Edit tracking
    delivered: { type: Boolean, default: false }, // 🆕 Delivery status
    read: { type: Boolean, default: false }, // 🆕 Read status
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
