# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## SkillHunt – Backend Evaluation Notes

This section documents the full stack used in  SkillHunt (AI Resume Optimizer + Real-Time Notification System), with explanations, examples, and brief comparisons to alternative choices. You can export this README as a PDF for viva/assessment.

### 1. Node.js

**What it is**
- JavaScript runtime built on Chrome’s V8 engine.
- Event-driven, non-blocking I/O – ideal for I/O-heavy APIs and real-time systems.

**How it is used**
- Runs the backend server (`server.js`).
- All controllers, routes, database logic, Socket.io server, and AI integrations are written as Node modules.

**Example**

```js
require('dotenv').config();
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
```

**Why Node.js (and not Java/Django/PHP)**
- Single language (JavaScript) across frontend + backend → faster development.
- Non-blocking I/O fits real-time features (Socket.io notifications).
- Huge ecosystem (Express, Mongoose, Socket.io, Multer, Google AI SDK, etc.).

---

### 2. Express.js

**What it is**
- Minimal web framework on top of Node’s HTTP module.
- Provides routing, middleware, and error handling.

**How it is used**
- Define REST API endpoints for auth, jobs, applications, profiles, AI, notifications, and users.
- Configure middleware (`cors`, `express.json`, static serving, auth).

**Example – app setup & routes**

```js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.route');
const profileRoutes = require('./routes/profile.route');
const notificationRoutes = require('./routes/notification.route');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
```

**Why Express (vs NestJS / Koa / Fastify)**
- Lightweight and flexible; good for a student project where we design our own structure.
- Very well known; easier to explain in interviews.
- We don’t need heavier abstractions (decorators, DI containers) for this scale.

---

### 3. MongoDB + Mongoose

**MongoDB**
- NoSQL document database; stores JSON-like documents.
- Flexible schema – ideal for nested, evolving profile data (skills, experience, education, ATS analytics).

**Mongoose**
- ODM (Object Data Modeling) library for MongoDB.
- Adds schemas, validation, and model APIs.

**How it is used**
- Define schemas for `User`, `Job`, `Application`, `Notification`.
- Embed profile info into `User.profile`:
  - `bio`, `skills[]`, `experience[]`, `education[]`, `resumes[]`, `followers[]`, `following[]`, `atsAnalytics[]`.
- Use `find`, `findById`, `findOne`, `findByIdAndUpdate`, `insertMany`, `populate`.

**Example – Notification schema**

```js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['job_application', 'job_posted', 'profile_follow', 'application_status_update'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

**Why MongoDB/Mongoose (vs SQL)**
- Profile and ATS data is deeply nested and changes over time → documents are more natural than rigid tables.
- No need for complex JOINs; references + populations are enough.
- Faster to evolve schema during development (no migrations).

---

### 4. JWT Authentication

**What it is**
- JSON Web Token: `header.payload.signature`.
- Payload is signed with a secret; client stores the token and sends it with each request.

**How it is used**
- On login/register, backend returns a JWT with `userId` and `role`.
- Frontend stores token and sends `Authorization: Bearer <token>`.
- `verifyAuth` middleware:
  - Verifies token using `jsonwebtoken`.
  - Attaches `req.user = { id, role }` on success.

**Example – verify middleware (conceptual)**

```js
const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

**Why JWT (vs server sessions)**
- Stateless: no server-side session storage needed, easier to scale.
- Works well with SPAs and mobile apps.
- Easy to secure specific endpoints based on `req.user.role` (student vs recruiter).

---

### 5. Multer (File Uploads)

**What it is**
- Middleware for handling `multipart/form-data`, primarily file uploads.

**How it is used**
- Uploading:
  - Profile picture (`profilePicture` field).
  - Multiple resume versions (`resume` field) and marking a default resume.
- Files are stored on disk under `uploads/`, and metadata is stored in MongoDB.

**Example – resume upload route**

```js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post(
  '/upload-resume',
  verifyAuth,
  upload.single('resume'),
  uploadResumeController
);
```

**Why Multer**
- Handles multipart parsing and file saving with minimal code.
- Integrates well with Express.
- Simpler than manually handling streams or using heavier upload services for this project size.

---

### 6. Socket.io (Real-Time Notifications)

**What it is**
- Library on top of WebSockets (with fallbacks) for real-time, bidirectional communication.

**How it is used**
- Real-time notification system:
  - Server stores `connectedUsers` map: `userId -> socketId`.
  - Client connects and emits `join` with their user id.
  - When a notification is created, the server:
    - Saves it to MongoDB.
    - If recipient is online, emits `newNotification` to their socket.

**Example – server setup**

```js
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on('disconnect', () => {
    if (socket.userId) connectedUsers.delete(socket.userId);
  });
});

global.io = io;
global.connectedUsers = connectedUsers;
```

**Example – creating & emitting a notification**

```js
const createNotification = async (data) => {
  const notification = await Notification.create(data);

  const recipientId = data.recipient.toString();
  if (global.io && global.connectedUsers.has(recipientId)) {
    const socketId = global.connectedUsers.get(recipientId);
    global.io.to(socketId).emit('newNotification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.read
    });
  }

  return notification;
};
```

**Why Socket.io (vs polling / SSE / raw WebSocket)**
- Gives auto-reconnect, rooms, and simple event API.
- Less boilerplate than raw WebSocket servers.
- Polling would increase latency and server load; SSE is one-way only.

---

### 7. Google Generative AI (Gemini) – ATS Resume Optimizer

**What it is**
- Official Node SDK: `@google/generative-ai`.
- Provides `generateContent` with models like `gemini-flash-latest`.

**How it is used**
- The ATS optimizer endpoint:
  - Accepts `jobDescription` and uses the candidate’s profile (bio, skills, experience, education).
  - Builds a detailed prompt instructing the model to behave as an ATS analyzer.
  - Asks the model to return **only JSON** with:
    - `score`, `matchedKeywords`, `missingKeywords`, `strengths`, `weaknesses`, `suggestions`, `overallFeedback`.
  - Cleans and parses the AI output.
  - On AI failure, falls back to keyword-based scoring.
  - Stores a summary of each analysis in `user.profile.atsAnalytics` (capped to last 10 entries).

**Example – calling Gemini (simplified)**

```js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const result = await model.generateContent(prompt);
const response = await result.response;
let text = response.text().trim();

text = text.replace(/```json/g, '').replace(/```/g, '');

const start = text.indexOf('{');
const end = text.lastIndexOf('}');
const jsonText = text.substring(start, end + 1);
const analysis = JSON.parse(jsonText);
```

**Why AI + fallback (vs only keyword matching)**
- AI:
  - Understands semantics, not just literal keywords.
  - Produces human-readable feedback, strengths, and suggestions.
- Fallback:
  - Guarantees the feature still works when the model is unavailable or quota is exceeded.

---

### 8. React + React Router + Context (Frontend Overview)

Even though the evaluation is backend-focused, understanding the frontend stack helps explain end‑to‑end flows.

**React**
- Builds the SPA with components (`Profile`, `Notifications`, `NotificationBell`, etc.).
- Uses hooks (`useState`, `useEffect`) for state and side effects.

**React Router**
- Manages client-side routes:
  - `/profile`, `/profile/:userId`, `/notifications`, `/jobs/:id`, etc.
- `ProtectedRoute` guards pages that require authentication.

**Context API**
- `AuthContext`: user info, JWT auth state, login/logout.
- `NotificationContext`: Socket.io client, notifications list, unread count, and functions to mark/read/delete.

**Why this combination**
- React is a de-facto standard for SPAs.
- React Router integrates smoothly with React and supports nested layouts.
- Context API is sufficient for global state here; Redux/Zustand would be overkill.

---

### 9. Axios API Layer & Styling

**Axios**
- Wrapper around `fetch` with better defaults and interceptors.
- Used to expose API helpers (`profileAPI`, `notificationAPI`, `aiAPI`, etc.), simplifying components.

**Styling**
- Utility-first classes (Tailwind-style) for speed and consistency.
- Custom CSS for navbar + hamburger + profile polish.

**Why**
- Axios reduces boilerplate for every HTTP request.
- Utility-first CSS speeds up implementation of a modern UI without a full design system.

---

These notes can be used directly as viva / backend evaluation material. You can export this README as a PDF and highlight:
- How each technology works.
- Where it is used in the project.
- Why it was chosen over alternatives.

