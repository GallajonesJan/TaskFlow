/* eslint-env node */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import taskRoutes from './routes/tasks.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import assignmentRoutes from './routes/assignments.js';
import commentRoutes from './routes/comments.js';
import attachmentRoutes from './routes/attachments.js';

import { runPreflightChecks } from './utils/preflight.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
// Nested routes should come before the base /tasks route
app.use('/tasks/:taskId/assignments', assignmentRoutes);
app.use('/tasks/:taskId/comments', commentRoutes);
app.use('/tasks/:taskId/attachments', attachmentRoutes);

app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);

// Start server only after checks pass
const startServer = async () => {
  try {
    await runPreflightChecks();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();