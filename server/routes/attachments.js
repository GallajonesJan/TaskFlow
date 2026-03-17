/* eslint-env node */
import express  from 'express';
import multer   from 'multer';
import supabase from '../services/supabaseClient.js';

const router = express.Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const BUCKET = 'task-attachments';

// ── GET /tasks/:taskId/attachments ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', req.params.taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attachments.', details: err.message });
  }
});

// ── POST /tasks/:taskId/attachments/file — upload a file ──────────────────────
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    const { taskId }  = req.params;
    const { userId }  = req.body;
    const file        = req.file;

    if (!file)   return res.status(400).json({ error: 'No file provided.' });
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const storagePath = `${userId}/${taskId}/${Date.now()}_${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const { data, error } = await supabase
      .from('task_attachments')
      .insert([{
        task_id:         taskId,
        user_id:         userId,
        attachment_type: 'file',
        file_name:       file.originalname,
        file_size:       file.size,
        mime_type:       file.mimetype,
        storage_path:    storagePath,
        url:             publicUrl,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('FULL UPLOAD ERROR:', err);
    res.status(500).json({ error: 'Failed to upload file.', details: err.message });
  }
});

// ── POST /tasks/:taskId/attachments/link — save a link ────────────────────────
router.post('/link', async (req, res) => {
  try {
    const { taskId }            = req.params;
    const { userId, url, title } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    if (!url?.trim()) return res.status(400).json({ error: 'URL is required.' });

    // Basic URL validation
    try { new URL(url); } catch {
      return res.status(400).json({ error: 'Invalid URL. Make sure it starts with http:// or https://' });
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .insert([{
        task_id:         taskId,
        user_id:         userId,
        attachment_type: 'link',
        file_name:       title?.trim() || url,
        link_url:        url.trim(),
        link_title:      title?.trim() || null,
        url:             url.trim(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save link.', details: err.message });
  }
});

// ── DELETE /tasks/:taskId/attachments/:attachmentId ───────────────────────────
router.delete('/:attachmentId', async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const { data: attachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('storage_path, attachment_type')
      .eq('id', attachmentId)
      .single();

    if (fetchError || !attachment) {
      return res.status(404).json({ error: 'Attachment not found.' });
    }

    // Only delete from storage if it's a file
    if (attachment.attachment_type === 'file' && attachment.storage_path) {
      await supabase.storage.from(BUCKET).remove([attachment.storage_path]);
    }

    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
    res.json({ message: 'Attachment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete attachment.', details: err.message });
  }
});

export default router;