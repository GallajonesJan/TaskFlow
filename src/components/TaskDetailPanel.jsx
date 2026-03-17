import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getComments, postComment, deleteComment, updateCompletion } from '../services';
import { getAttachments, uploadAttachment, saveLink, deleteAttachment } from '../services/attachmentService';
import './TaskDetailPanel.scss';

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileEmoji = (mimeType) => {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📄';
};

const TaskDetailPanel = (props) => {
  const {
    task,
    assignments = [],
    onClose,
    isAdmin,
    selectedNotification = null,
  } = props;

  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const commentsSectionRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [attachTab, setAttachTab] = useState('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const myAssignment = assignments.find(
    (a) => a.user_id === user?.id || a.profiles?.id === user?.id
  );

  useEffect(() => {
    if (!task) return;

    setComments([]);
    setAttachments([]);
    setCommentBody('');
    setLinkUrl('');
    setLinkTitle('');
    setLinkError('');

    setLoadingComments(true);
    getComments(task.id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoadingComments(false));

    setLoadingAttachments(true);
    getAttachments(task.id)
      .then(setAttachments)
      .catch(() => {})
      .finally(() => setLoadingAttachments(false));
  }, [task?.id]);

  useEffect(() => {
    if (!selectedNotification || !task) return;

    if (selectedNotification.title === 'New Comment') {
      setTimeout(() => {
        commentsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 200);
    }
  }, [selectedNotification, task]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim() || posting) return;

    setPosting(true);
    try {
      const newComment = await postComment(task.id, commentBody, user.id);
      setComments((prev) => [...prev, newComment]);
      setCommentBody('');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(task.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleToggleMyDone = async () => {
    if (!myAssignment) return;
    const newVal = !myAssignment.completed;
    await updateCompletion(task.id, user.id, newVal);
    myAssignment.completed = newVal;
  };

  const handleUpload = async (files) => {
    if (!files.length || uploading) return;

    setUploading(true);
    try {
      for (const file of files) {
        const att = await uploadAttachment(task.id, file, user.id);
        setAttachments((prev) => [att, ...prev]);
      }
    } catch (err) {
      console.error('Upload failed:', err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInput = (e) => handleUpload(Array.from(e.target.files));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(Array.from(e.dataTransfer.files));
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    setLinkError('');

    if (!linkUrl.trim()) {
      setLinkError('URL is required.');
      return;
    }

    const finalUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

    setSavingLink(true);
    try {
      const att = await saveLink(task.id, finalUrl, linkTitle, user.id);
      setAttachments((prev) => [att, ...prev]);
      setLinkUrl('');
      setLinkTitle('');
    } catch (err) {
      setLinkError(err.message);
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    await deleteAttachment(task.id, attachmentId);
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  if (!task) return null;

  const priorityColor = PRIORITY_COLORS[task.priority] ?? '#94a3b8';
  const fileAttachments = attachments.filter(
    (a) => a.attachment_type === 'file' || !a.attachment_type
  );
  const linkAttachments = attachments.filter((a) => a.attachment_type === 'link');

  return (
    <div className="task-panel">
      <div className="task-panel__header">
        <div className="task-panel__header-left">
          <span
            className="task-panel__priority-dot"
            style={{ background: priorityColor }}
          />
          <h2 className="task-panel__title">{task.title}</h2>
        </div>
        <button className="task-panel__close" onClick={onClose} type="button">
          <XIcon />
        </button>
      </div>

      <div className="task-panel__body">
        <div className="task-panel__meta">
          <div className="task-panel__meta-item">
            <span className="task-panel__meta-label">Priority</span>
            <span className="task-panel__meta-value" style={{ color: priorityColor }}>
              {task.priority}
            </span>
          </div>

          <div className="task-panel__meta-item">
            <span className="task-panel__meta-label">Due Date</span>
            <span className="task-panel__meta-value">{formatDate(task.due_date)}</span>
          </div>

          <div className="task-panel__meta-item">
            <span className="task-panel__meta-label">Status</span>
            <span
              className={`task-panel__status ${task.completed ? 'task-panel__status--done' : ''}`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>

          {task.category && (
            <div className="task-panel__meta-item">
              <span className="task-panel__meta-label">Category</span>
              <span className="task-panel__meta-value">{task.category}</span>
            </div>
          )}
        </div>

        {(task.description || task.notes) && (
          <div className="task-panel__section">
            <h3 className="task-panel__section-title">Notes</h3>
            <p className="task-panel__notes">{task.description ?? task.notes}</p>
          </div>
        )}

        {!isAdmin && myAssignment && (
          <div className="task-panel__section">
            <h3 className="task-panel__section-title">My Progress</h3>
            <button
              className={`task-panel__my-done ${
                myAssignment.completed ? 'task-panel__my-done--done' : ''
              }`}
              onClick={handleToggleMyDone}
              type="button"
            >
              <div
                className={`task-panel__my-done-check ${
                  myAssignment.completed ? 'task-panel__my-done-check--filled' : ''
                }`}
              >
                {myAssignment.completed && <CheckIcon />}
              </div>
              {myAssignment.completed ? 'Mark as incomplete' : 'Mark as done'}
            </button>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="task-panel__section">
            <h3 className="task-panel__section-title">
              Assigned To ({assignments.length})
            </h3>
            <div className="task-panel__assignees">
              {assignments.map((a) => {
                const name = a.profiles?.name ?? a.profiles?.email ?? 'Unknown';

                return (
                  <div key={a.id} className="task-panel__assignee">
                    <div className="task-panel__assignee-avatar">
                      {name[0].toUpperCase()}
                    </div>
                    <div className="task-panel__assignee-info">
                      <p className="task-panel__assignee-name">{name}</p>
                      <p className="task-panel__assignee-email">{a.profiles?.email}</p>
                    </div>
                    <span
                      className={`task-panel__assignee-status ${
                        task.completed ? 'task-panel__assignee-status--done' : ''
                      }`}
                    >
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="task-panel__section">
          <h3 className="task-panel__section-title">
            Attachments {attachments.length > 0 && `(${attachments.length})`}
          </h3>

          <div className="task-panel__attach-tabs">
            <button
              className={`task-panel__attach-tab ${
                attachTab === 'file' ? 'task-panel__attach-tab--active' : ''
              }`}
              onClick={() => setAttachTab('file')}
              type="button"
            >
              <UploadIcon /> File
            </button>
            <button
              className={`task-panel__attach-tab ${
                attachTab === 'link' ? 'task-panel__attach-tab--active' : ''
              }`}
              onClick={() => setAttachTab('link')}
              type="button"
            >
              <LinkIcon /> Link
            </button>
          </div>

          {attachTab === 'file' && (
            <div
              className={`task-panel__dropzone ${
                dragOver ? 'task-panel__dropzone--over' : ''
              } ${uploading ? 'task-panel__dropzone--uploading' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <UploadIcon />
              <p className="task-panel__dropzone-text">
                {uploading ? 'Uploading...' : 'Click or drag files here'}
              </p>
              <p className="task-panel__dropzone-hint">Max 10MB per file</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>
          )}

          {attachTab === 'link' && (
            <form className="task-panel__link-form" onSubmit={handleSaveLink}>
              <input
                className={`task-panel__link-input ${
                  linkError ? 'task-panel__link-input--error' : ''
                }`}
                placeholder="https://drive.google.com/..."
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setLinkError('');
                }}
              />
              <input
                className="task-panel__link-input"
                placeholder="Link title (optional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
              {linkError && <p className="task-panel__link-error">{linkError}</p>}
              <button
                type="submit"
                className="btn-primary"
                disabled={savingLink}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LinkIcon />
                {savingLink ? 'Saving...' : 'Add Link'}
              </button>
            </form>
          )}

          {loadingAttachments ? (
            <p className="task-panel__loading">Loading attachments...</p>
          ) : attachments.length === 0 ? (
            <p className="task-panel__empty-comments">No attachments yet.</p>
          ) : (
            <div className="task-panel__attachments">
              {fileAttachments.map((att) => (
                <div key={att.id} className="task-attachment">
                  <span className="task-attachment__icon">
                    {getFileEmoji(att.mime_type)}
                  </span>
                  <div className="task-attachment__info">
                    <p className="task-attachment__name">{att.file_name}</p>
                    <p className="task-attachment__size">
                      {formatFileSize(att.file_size)}
                    </p>
                  </div>
                  <div className="task-attachment__actions">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="task-attachment__btn task-attachment__btn--download"
                      download={att.file_name}
                      title="Download"
                    >
                      <DownloadIcon />
                    </a>
                    {(isAdmin || att.user_id === user?.id) && (
                      <button
                        className="task-attachment__btn task-attachment__btn--delete"
                        onClick={() => handleDeleteAttachment(att.id)}
                        type="button"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {linkAttachments.map((att) => (
                <div key={att.id} className="task-attachment task-attachment--link">
                  <span className="task-attachment__icon">🔗</span>
                  <div className="task-attachment__info">
                    <p className="task-attachment__name">
                      {att.link_title || att.link_url}
                    </p>
                    <p className="task-attachment__size task-attachment__url">
                      {att.link_url}
                    </p>
                  </div>
                  <div className="task-attachment__actions">
                    <a
                      href={att.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="task-attachment__btn task-attachment__btn--download"
                      title="Open link"
                    >
                      <ExternalIcon />
                    </a>
                    {(isAdmin || att.user_id === user?.id) && (
                      <button
                        className="task-attachment__btn task-attachment__btn--delete"
                        onClick={() => handleDeleteAttachment(att.id)}
                        type="button"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="task-panel__section" ref={commentsSectionRef}>
          <h3 className="task-panel__section-title">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>

          {loadingComments ? (
            <p className="task-panel__loading">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="task-panel__empty-comments">No comments yet — be the first!</p>
          ) : (
            <div className="task-panel__comments">
              {comments.map((c) => {
                const name = c.profiles?.name ?? c.profiles?.email ?? 'Unknown';
                const isOwn = c.user_id === user?.id;

                return (
                  <div key={c.id} className="comment">
                    <div className="comment__avatar">{name[0].toUpperCase()}</div>
                    <div className="comment__body">
                      <div className="comment__header">
                        <span className="comment__name">{name}</span>
                        <span className="comment__time">{timeAgo(c.created_at)}</span>
                        {(isOwn || isAdmin) && (
                          <button
                            className="comment__delete"
                            onClick={() => handleDeleteComment(c.id)}
                            type="button"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                      <p className="comment__text">{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form className="task-panel__comment-form" onSubmit={handlePostComment}>
            <div className="task-panel__comment-avatar">
              {(user?.user_metadata?.name ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
            <input
              className="task-panel__comment-input"
              placeholder="Add a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button
              type="submit"
              className="task-panel__comment-send"
              disabled={!commentBody.trim() || posting}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;