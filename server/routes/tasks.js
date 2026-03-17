/* eslint-env node */
import express from 'express';
import supabase from '../services/supabaseClient.js';

const router = express.Router();

// Actual columns in your tasks table:
// id, title, description, completed, completed_date,
// priority, category (text), due_date, created_date, updated_date

const VALID_PRIORITIES = ['low', 'medium', 'high', 'Low', 'Medium', 'High'];

// ── GET /tasks ────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.', details: err.message });
  }
});

// ── GET /tasks/:id ────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Task not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.', details: err.message });
  }
});

// ── POST /tasks ───────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, priority, due_date, category, description, notes } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!due_date)      return res.status(400).json({ error: 'Due date is required.' });
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high.' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title:       title.trim(),
        priority:    (priority ?? 'medium').toLowerCase(),
        due_date:    due_date,
        category:    category ?? null,
        description: description ?? notes ?? null,
        completed:   false,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.', details: err.message });
  }
});

// ── PUT /tasks/:id ────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const { title, priority, due_date, category, description, notes, completed } = req.body;

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high.' });
    }

    const updates = {};
    if (title       !== undefined) updates.title       = title.trim();
    if (priority    !== undefined) updates.priority    = priority.toLowerCase();
    if (due_date    !== undefined) updates.due_date    = due_date;
    if (category    !== undefined) updates.category    = category;
    if (description !== undefined) updates.description = description;
    if (notes       !== undefined) updates.description = notes;
    if (completed   !== undefined) {
      updates.completed      = completed;
      updates.completed_date = completed ? new Date().toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    updates.updated_date = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // get users assigned to this task
    const { data: assignedUsers, error: assignError } = await supabase
      .from('task_assignments')
      .select('user_id')
      .eq('task_id', id);

    if (assignError) throw assignError;

    let message = `Task "${data.title}" has been updated.`;

    if (completed !== undefined) {
      message = completed
        ? `Task "${data.title}" was marked as completed.`
        : `Task "${data.title}" was marked as pending.`;
    }

    const notifications = (assignedUsers ?? []).map(a => ({
      user_id: a.user_id,
      title: 'Task Updated',
      message,
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) throw notifError;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.', details: err.message });
  }
});

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('tasks').select('id').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.', details: err.message });
  }
});

export default router;