/* eslint-env node */
import 'dotenv/config';
import express          from 'express';
import cors             from 'cors';
import taskRoutes       from './routes/tasks.js';
import categoryRoutes   from './routes/categories.js';
import userRoutes       from './routes/users.js';
import assignmentRoutes from './routes/assignments.js';
import commentRoutes    from './routes/comments.js';
import attachmentRoutes from './routes/attachments.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => res.json({ status: 'ok' }));

// Nested routes BEFORE base /tasks
app.use('/tasks/:taskId/assignments',  assignmentRoutes);
app.use('/tasks/:taskId/comments',     commentRoutes);
app.use('/tasks/:taskId/attachments',  attachmentRoutes);
app.use('/tasks',                      taskRoutes);
app.use('/categories',                 categoryRoutes);
app.use('/users',                      userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));