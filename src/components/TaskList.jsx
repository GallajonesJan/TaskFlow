import './TaskList.scss';
import TaskItem from './TaskItem';

const TaskList = ({ tasks = [], onToggle, onEdit, onDelete, onAssign, onClickTask, isAdmin = false, assignments = [], empty = 'No tasks found.' }) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list task-list--empty">
        <div className="task-list__empty-icon">📋</div>
        <p className="task-list__empty-text">{empty}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => {
        const assignedCount = assignments.filter(a => a.task_id === task.id).length;
        return (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssign}
            onClick={() => onClickTask?.(task)}
            isAdmin={isAdmin}
            assignedCount={assignedCount}
          />
        );
      })}
    </div>
  );
};

export default TaskList;
