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

    if (!body?.trim()) {
      return res.status(400).json({ error: 'Comment body is required.' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    // 1. Save comment first
    const { data, error } = await supabase
      .from('task_comments')
      .insert([{ task_id: taskId, user_id: userId, body: body.trim() }])
      .select('id, body, created_at, updated_at, user_id')
      .single();

    if (error) throw error;

    // Return comment success even if notifications/email fail
    const [enriched] = await enrichWithProfiles([data]);

    // 2. Run notification/email logic separately
    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      const { data: assignedUsers, error: assignError } = await supabase
        .from('task_assignments')
        .select('user_id')
        .eq('task_id', taskId);

      if (assignError) throw assignError;

      const assignedUserIds = (assignedUsers ?? []).map(a => a.user_id);

      let allowedUserIds = new Set();

      if (assignedUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, push_notifications')
          .in('id', assignedUserIds);

        if (profilesError) throw profilesError;

        allowedUserIds = new Set(
          (profiles ?? [])
            .filter(p => p.push_notifications ?? true)
            .map(p => p.id)
        );
      }

      const notifications = (assignedUsers ?? [])
        .filter(a => a.user_id !== userId && (allowedUserIds.size === 0 || allowedUserIds.has(a.user_id)))
        .map(a => ({
          user_id: a.user_id,
          task_id: taskId,
          title: 'New Comment',
          message: `New comment on "${task.title}".`,
        }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifError) throw notifError;
      }

      // admin email is optional
      if (process.env.ADMIN_EMAIL) {
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('id, email, email_notifications')
          .eq('email', process.env.ADMIN_EMAIL)
          .maybeSingle();

        if (adminError) throw adminError;

        if (adminProfile?.email_notifications) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New comment on task: ${task.title}`,
            text: `A new comment was added to the task "${task.title}":\n\n${body.trim()}`,
          });
        }
      }
    } catch (sideEffectErr) {
      console.error('COMMENT SIDE EFFECT ERROR:', sideEffectErr);
    }

    res.status(201).json(enriched);
  } catch (err) {
    console.error('POST COMMENT ERROR:', err);
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