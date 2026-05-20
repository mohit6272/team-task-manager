import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '○', bg: 'bg-gray-100', count_bg: 'bg-white text-gray-500' },
  { key: 'in-progress', label: 'In Progress', icon: '⟳', bg: 'bg-blue-50', count_bg: 'bg-white text-blue-600' },
  { key: 'done', label: 'Done', icon: '✓', bg: 'bg-emerald-50', count_bg: 'bg-white text-emerald-600' },
];

const DEFAULT_FORM = { title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(projRes.data.members || []);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, project: id, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined };
      const res = await API.post('/tasks', payload);
      setTasks([res.data, ...tasks]);
      setShowForm(false);
      setForm(DEFAULT_FORM);
      toast.success('Task created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create task'); }
  };

  const handleUpdate = (updated) => setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  const handleDelete = (deletedId) => setTasks((prev) => prev.filter((t) => t._id !== deletedId));

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  const progress = tasks.length > 0 ? Math.round((grouped['done'].length / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6">
          <Link to="/projects" className="hover:text-indigo-600 transition-colors font-medium">Projects</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none">{project?.name}</span>
        </div>

        {/* Project Header */}
        <div className="card p-4 sm:p-6 mb-5 sm:mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{project?.name}</h1>
                <span className={`badge shrink-0 ${
                  project?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  project?.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{project?.status}</span>
              </div>
              {project?.description && <p className="text-gray-500 text-sm mb-3 sm:mb-4">{project.description}</p>}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">Progress</span>
                  <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {members.slice(0, 5).map((m) => (
                    <div key={m._id}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold hover:scale-110 hover:z-10 relative transition-transform"
                      title={m.name}
                    >
                      {m.name?.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{members.length} member{members.length !== 1 ? 's' : ''}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
                  {showForm ? '✕ Cancel' : '+ Add Task'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="card p-4 sm:p-6 mb-5 sm:mb-6 border-indigo-100 shadow-md">
            <h2 className="text-base font-bold text-gray-900 mb-4 sm:mb-5">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Task Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="What needs to be done?" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Additional details..." rows={2} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Assign To</label>
                  <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input-field">
                    <option value="">Unassigned</option>
                    {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Initial Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="btn-primary text-sm">Create Task</button>
                <button type="button" onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Board — horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-5 min-w-[640px]">
            {COLUMNS.map((col) => (
              <div key={col.key} className={`${col.bg} rounded-2xl p-3 sm:p-4`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg">{col.icon}</span>
                    <h3 className="font-bold text-gray-700 text-xs sm:text-sm">{col.label}</h3>
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${col.count_bg}`}>
                      {grouped[col.key].length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {grouped[col.key].map((task) => (
                    <TaskCard key={task._id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                  {grouped[col.key].length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
