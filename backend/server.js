require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
// Use Render's PORT in production, fallback to 4000 for local dev
const PORT = process.env.PORT || 4000;
const connectDB = require('./config/connectDB');
const authRoutes = require('./routes/auth.route');
const projectRoutes = require('./routes/project.route');
const jobRoutes = require('./routes/job.route');
const applicationRoutes = require('./routes/application.route');
const aiRoutes = require('./routes/ai.route');
const profileRoutes = require('./routes/profile.route');
const usersRoutes = require('./routes/users.route');
const notificationRoutes = require('./routes/notification.route');
const messageRoutes = require('./routes/message.route');
const startKeepAlive = require('./keepAlive');

// Accept a comma-separated list of origins so Vercel preview deploys (which
// each get a unique URL) can be whitelisted alongside the production domain.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Handle user joining with their ID
  socket.on('join', (userId) => {
    if (!userId) return;
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    // Rooms let us reliably reach a user even when they have multiple
    // simultaneous socket connections (e.g. notifications + messages tabs).
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  // --- Messaging: typing indicators (broadcast only, no persistence) ---
  socket.on('typing:start', ({ conversationId, toUserId }) => {
    if (!socket.userId || !toUserId || !conversationId) return;
    io.to(`user:${toUserId}`).emit('typing:start', {
      conversationId,
      fromUserId: socket.userId,
    });
  });

  socket.on('typing:stop', ({ conversationId, toUserId }) => {
    if (!socket.userId || !toUserId || !conversationId) return;
    io.to(`user:${toUserId}`).emit('typing:stop', {
      conversationId,
      fromUserId: socket.userId,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Only clear the map entry if it still points to this socket — another
      // tab for the same user may have overwritten it with a newer socket id.
      if (connectedUsers.get(socket.userId) === socket.id) {
        connectedUsers.delete(socket.userId);
      }
      console.log(`👋 User ${socket.userId} disconnected`);
    }
  });
});

// Make io available globally
global.io = io;
global.connectedUsers = connectedUsers;

// Render (and most PaaS hosts) terminate TLS at a proxy; trust it so
// `secure: true` cookies are actually sent back to the browser.
app.set('trust proxy', 1);

// middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
// Application Level Middleware
/*
- it used to parese the json data to JavaScript object
- it logs all the incoming requests
- CORS handling
- 
*/
app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies from requests

// Serve static files (uploaded files)
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
})

connectDB().then(() => {
  server.listen(PORT, () => { 
    console.log(`🚀 Server is running on port http://localhost:${PORT}`)
    console.log(`📡 Socket.io server ready for real-time notifications`)
    // Prevent Render's free-tier 15m idle shutdown by self-pinging.
    startKeepAlive();
  })
}).catch((error) => { console.log(error)});