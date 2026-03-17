/* eslint-env node */
import express from 'express';
import supabase from '../services/supabaseClient.js';

const router = express.Router();

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// ── GET /categories ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.', details: err.message });
  }
});

// ── POST /categories ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name?.trim())               return res.status(400).json({ error: 'Name is required.' });
    if (name.trim().length > 50)     return res.status(400).json({ error: 'Name must be 50 characters or less.' });
    if (!color)                      return res.status(400).json({ error: 'Color is required.' });
    if (!HEX_COLOR_REGEX.test(color)) return res.status(400).json({ error: 'Color must be a valid hex code (e.g. #6366f1).' });

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim(), color }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.', details: err.message });
  }
});

// ── PUT /categories/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Check exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    if (!name?.trim() && !color) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    if (name && name.trim().length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less.' });
    }

    if (color && !HEX_COLOR_REGEX.test(color)) {
      return res.status(400).json({ error: 'Color must be a valid hex code.' });
    }

    const updates = {};
    if (name?.trim()) updates.name  = name.trim();
    if (color)        updates.color = color;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.', details: err.message });
  }
});

// ── DELETE /categories/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.', details: err.message });
  }
});

export default router;
