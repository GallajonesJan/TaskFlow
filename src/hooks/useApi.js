import { useState, useCallback } from 'react';

/**
 * useApi
 * Wraps any async function with loading, error, and in-flight prevention.
 *
 * Usage:
 *   const { execute, loading, error } = useApi(createTask);
 *   await execute(taskData);  // loading=true while running, error set if it fails
 */
const useApi = (fn) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    if (loading) return; // prevent duplicate submissions
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, loading]);

  return { execute, loading, error, setError };
};

export default useApi;
