/**
 * api.js
 * Base fetch wrapper that automatically injects the x-user-email header
 * so the backend can identify admin requests.
 *
 * Usage:
 *   import { api } from './api';
 *   const data = await api.get('/tasks');
 *   const data = await api.post('/tasks', { title: '...' });
 */

const API_URL = import.meta.env.VITE_API_BASE_URL;

let _userEmail = '';

// Call this once when the user logs in
export const setApiUser = (email) => { _userEmail = email ?? ''; };

const request = async (method, path, body) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': _userEmail,
    },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
};

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
};
