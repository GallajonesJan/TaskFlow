const API_URL = import.meta.env.VITE_API_URL;

let _userEmail = '';
export const setAttachmentUser = (email) => { _userEmail = email ?? ''; };

const headers = () => ({ 'x-user-email': _userEmail });

export const getAttachments = async (taskId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch attachments');
  return res.json();
};

// Upload a real file
export const uploadAttachment = async (taskId, file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments/file`, {
    method: 'POST',
    headers: headers(), // no Content-Type — browser sets it with boundary
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
};

// Save a link
export const saveLink = async (taskId, url, title, userId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments/link`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title, userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to save link' }));
    throw new Error(err.error || 'Failed to save link');
  }
  return res.json();
};

export const deleteAttachment = async (taskId, attachmentId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to delete attachment');
  return res.json();
};
