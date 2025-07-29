  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const dotenv = require('dotenv');
  const { createServer } = require('http');
  const { Server } = require('socket.io');
  const path = require('path'); // ✅ For serving frontend build later if needed

  dotenv.config();
  const app = express();
  const httpServer = createServer(app);

  // Import Routes
  //const mediaRoutes = require('./routes/mediaRoutes');
  const authRoutes = require('./routes/authRoutes');
  const postRoutes = require('./routes/postRoutes');
  const messageRoutes = require('./routes/messageRoutes');
  const userRoutes = require('./routes/userRoutes');

  // Middleware
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());
    
  // ✅ Root Test Route
  app.get('/api/test', (req, res) => {
    console.log('✅ API test route hit');
    res.json({ message: 'Backend API working fine' });
  });

  // Mount API routes
  //app.use('/api/media', mediaRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/users', userRoutes);

  // ✅ Optional: Serve frontend build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    );
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Error:', err));

  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('joinRoom', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ID ${socket.id}`);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('newMessage', (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver._id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messageReceived', message);
      }
    });

    socket.on('typing', (receiverId) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', receiverId);
      }
    });

    socket.on('stopTyping', (receiverId) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', receiverId);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('❌ User disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
