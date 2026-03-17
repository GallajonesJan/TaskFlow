import { useState } from 'react';

const EMPTY_FORM = {
  title:       '',
  priority:    'Medium',
  category:    '',   // text field, not UUID
  due_date:    '',
  description: '',   // maps to description column
};

const useTaskForm = (onSubmit, categories = [], initialValues = null) => {
  const [fields, setFields] = useState(initialValues ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!fields.title.trim()) next.title    = 'Title is required.';
    if (!fields.due_date)     next.due_date = 'Due date is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const task = {
      title:       fields.title.trim(),
      priority:    fields.priority || 'Medium',
      category:    fields.category || null,
      due_date:    fields.due_date,
      description: fields.description.trim(),
    };

    onSubmit(task);
    reset();
  };

  const reset   = () => { setFields(EMPTY_FORM); setErrors({}); };
  const resetTo = (vals) => {
    setFields({
      title:       vals.title       ?? '',
      priority:    vals.priority    ?? 'Medium',
      category:    vals.category    ?? '',
      due_date:    vals.due_date    ? vals.due_date.split('T')[0] : '',
      description: vals.description ?? vals.notes ?? '',
    });
    setErrors({});
  };

  return { fields, errors, handleChange, handleSubmit, reset, resetTo };
};

export default useTaskForm;