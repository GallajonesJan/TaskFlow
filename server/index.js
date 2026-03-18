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


// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
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


const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_ORIGIN_PREVIEW,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
// Start server only after checks pass
const startServer = async () => {
  try {
    await runPreflightChecks();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error('❌ Server failed to start');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();