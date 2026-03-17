/* eslint-env node */
import express from 'express';
import supabase from '../services/supabaseClient.js';
import transporter from '../services/mailer.js';

const router = express.Router({ mergeParams: true });

// Helper: enrich comments with profile data
const enrichWithProfiles = async (comments) => {
  if (!comments.length) return comments;
  const userIds = [...new Set(comments.map(c => c.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);

  const profileMap = {};
  (profiles ?? []).forEach(p => { profileMap[p.id] = p; });

  return comments.map(c => ({ ...c, profiles: profileMap[c.user_id] ?? null }));
};

// GET /tasks/:taskId/comments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .select('id, body, created_at, updated_at, user_id')
      .eq('task_id', req.params.taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const enriched = await enrichWithProfiles(data ?? []);
    res.json(enriched);
  } catch (err) {
    console.error('BACKEND_ERROR [GET /comments]:', err);
    res.status(500).json({ error: 'Failed to fetch comments.', details: err.message });
  }
});

// POST /tasks/:taskId/comments
router.post('/', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { body, userId } = req.body;

    if (!body?.trim()) return res.status(400).json({ error: 'Comment body is required.' });
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const { data, error } = await supabase
      .from('task_comments')
      .insert([{ task_id: taskId, user_id: userId, body: body.trim() }])
      .select('id, body, created_at, updated_at, user_id')
      .single();

    if (error) throw error;

    // get task info
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    // get assigned users
    const { data: assignedUsers, error: assignError } = await supabase
      .from('task_assignments')
      .select('user_id')
      .eq('task_id', taskId);

    if (assignError) throw assignError;

    // notify assigned users except commenter
    const notifications = (assignedUsers ?? [])
      .filter(a => a.user_id !== userId)
      .map(a => ({
        user_id: a.user_id,
        title: 'New Comment',
        message: `New comment on "${task.title}".`,
      }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) throw notifError;
    }

    // email admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New comment on task: ${task.title}`,
      text: `A new comment was added to the task "${task.title}":\n\n${body.trim()}`,
    });

    const [enriched] = await enrichWithProfiles([data]);
    res.status(201).json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment.', details: err.message });
  }
});

// DELETE /tasks/:taskId/comments/:commentId
router.delete('/:commentId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', req.params.commentId);

    if (error) throw error;
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.', details: err.message });
  }
});

export default router;