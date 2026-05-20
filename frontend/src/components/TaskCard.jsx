import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  'todo': 'bg-gray-100 text-gray-600 border-gray-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'done': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PRIORITY_DOT = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
};

const PRIORITY_LABEL = {
  low: 'text-emerald-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
};

export default function TaskCard({ task, onUpdate, onDelete }) {
  const { isAdmin } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const handleStatusChange = async (e) => {
    setUpdating(true);
    try {
      const res = await API.put(`/tasks/${task._id}`, { status: e.target.value });
      onUpdate(res.data);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await API.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div
      className={`group bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isOverdue ? 'border-red-200 bg-red-50/20' : 'border-gray-100 hover:border-indigo-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-800 text-sm leading-tight flex-1 group-hover:text-indigo-700 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium}`} />
          <span className={`text-xs font-medium capitalize ${PRIORITY_LABEL[task.priority] || PRIORITY_LABEL.medium}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {task.project?.name && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium hover:bg-indigo-100 transition-colors">
            {task.project.name}
          </span>
        )}
        {task.assignedTo && (
          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-gray-100 transition-colors">
            <span className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full inline-flex items-center justify-center text-white text-[8px] font-bold">
              {task.assignedTo.name?.charAt(0)}
            </span>
            {task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
            isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-500'
          }`}>
            {isOverdue && '⚠ '}
            {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            {isOverdue && ' Overdue'}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all hover:opacity-80 ${STATUS_STYLES[task.status]}`}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="icon-btn-danger opacity-0 group-hover:opacity-100 text-sm"
            title="Delete task"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
