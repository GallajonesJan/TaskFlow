/* eslint-env node */
import express from 'express';
import supabase from '../services/supabaseClient.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Helper: enrich assignments with profile data
const enrichWithProfiles = async (assignments) => {
  if (!assignments.length) return assignments;
  const userIds = [...new Set(assignments.map(a => a.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);

  const profileMap = {};
  (profiles ?? []).forEach(p => { profileMap[p.id] = p; });

  return assignments.map(a => ({
    ...a,
    profiles: profileMap[a.user_id] ?? null,
  }));
};

// GET /tasks/:taskId/assignments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_assignments')
      .select('id, completed, assigned_at, user_id, task_id')
      .eq('task_id', req.params.taskId);

    if (error) throw error;
    const enriched = await enrichWithProfiles(data ?? []);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments.', details: err.message });
  }
});

// POST /tasks/:taskId/assignments — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array.' });
    }

    const rows = userIds.map(userId => ({ task_id: taskId, user_id: userId }));

    const { data, error } = await supabase
      .from('task_assignments')
      .upsert(rows, { onConflict: 'task_id,user_id' })
      .select('id, completed, assigned_at, user_id, task_id');

    if (error) throw error;

// get task title
const { data: task, error: taskError } = await supabase
  .from('tasks')
  .select('title')
  .eq('id', taskId)
  .single();

if (taskError) throw taskError;

// get notification preferences of assigned users
const assignedUserIds = (data ?? []).map(a => a.user_id);

const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('id, push_notifications')
  .in('id', assignedUserIds);

if (profilesError) throw profilesError;

const allowedUserIds = new Set(
  (profiles ?? [])
    .filter(p => p.push_notifications)
    .map(p => p.id)
);

// create notifications only for users who enabled push notifications
const notifications = (data ?? [])
  .filter(a => allowedUserIds.has(a.user_id))
  .map(a => ({
    user_id: a.user_id,
    task_id: taskId,
    title: 'New Task Assigned',
    message: `You have been assigned to "${task.title}".`,
  }));

if (notifications.length > 0) {
  const { error: notifError } = await supabase
    .from('notifications')
    .insert(notifications);

  if (notifError) throw notifError;
}

    const enriched = await enrichWithProfiles(data ?? []);
    res.status(201).json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign users.', details: err.message });
  }
});

// DELETE /tasks/:taskId/assignments/:userId — admin only
router.delete('/:userId', requireAdmin, async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    const { error } = await supabase
      .from('task_assignments')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'User unassigned successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unassign user.', details: err.message });
  }
});

// PATCH /tasks/:taskId/assignments/:userId — member marks own completion
router.patch('/:userId', async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean.' });
    }

    const { data, error } = await supabase
      .from('task_assignments')
      .update({ completed })
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update completion.', details: err.message });
  }
});

export default router;