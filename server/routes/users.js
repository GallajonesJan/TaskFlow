/* eslint-env node */
import express from 'express';
import supabase from '../services/supabaseClient.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /users — list all registered users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.', details: err.message });
  }
});

export default router;
