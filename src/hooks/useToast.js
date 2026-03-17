import { useState, useCallback } from 'react';

let nextId = 0;

/**
 * useToast
 * Returns { toasts, toast }
 * toast.success(msg) / toast.error(msg) / toast.info(msg)
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const toast = {
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
  };

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, toast, remove };
};

export default useToast;
