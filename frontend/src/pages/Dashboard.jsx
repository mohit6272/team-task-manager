import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FILTERS = ['all', 'todo', 'in-progress', 'done'];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    Promise.all([API.get('/tasks'), API.get('/projects')])
      .then(([t, p]) => { setTasks(t.data); setProjects(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const recentProjects = projects.slice(0, 4);

  const handleUpdate = (updated) => setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  const handleDelete = (id) => setTasks((prev) => prev.filter((t) => t._id !== id));

  const STAT_CARDS = [
    { label: 'Total Tasks', value: stats.total, bg: 'bg-indigo-50', icon: '◫', iconColor: 'bg-indigo-500' },
    { label: 'To Do', value: stats.todo, bg: 'bg-slate-50', icon: '○', iconColor: 'bg-slate-400' },
    { label: 'In Progress', value: stats.inProgress, bg: 'bg-blue-50', icon: '⟳', iconColor: 'bg-blue-500' },
    { label: 'Completed', value: stats.done, bg: 'bg-emerald-50', icon: '✓', iconColor: 'bg-emerald-500' },
    { label: 'Overdue', value: stats.overdue, bg: 'bg-red-50', icon: '⚠', iconColor: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isAdmin
              ? `Managing ${projects.length} project${projects.length !== 1 ? 's' : ''} across your team`
              : `You have ${stats.todo} tasks to do and ${stats.inProgress} in progress`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${s.iconColor} rounded-xl flex items-center justify-center text-white text-sm sm:text-base mb-2 sm:mb-3`}>
                {s.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {isAdmin ? 'All Tasks' : 'My Tasks'}
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap capitalize ${
                      filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="card p-10 sm:p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No tasks found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isAdmin ? 'Create your first task in a project' : 'No tasks assigned to you yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

          {/* Projects sidebar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Projects</h2>
              <Link to="/projects" className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                View all →
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-3xl mb-2">◫</div>
                <p className="text-gray-400 text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentProjects.map((p) => (
                  <Link key={p._id} to={`/projects/${p._id}`}>
                    <div className="card-hover p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                          p.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{p.members?.length || 0} member{p.members?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Team overview for admin */}
            {isAdmin && (
              <div className="mt-4 sm:mt-6 card p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-800 mb-3">Team Overview</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Total Projects', value: projects.length },
                    { label: 'Active', value: projects.filter((p) => p.status === 'active').length },
                    { label: 'Total Tasks', value: stats.total },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-xs hover:bg-white/50 px-1 py-0.5 rounded transition-colors">
                      <span className="text-indigo-600">{item.label}</span>
                      <span className="font-bold text-indigo-800">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs hover:bg-white/50 px-1 py-0.5 rounded transition-colors">
                    <span className="text-red-500">Overdue</span>
                    <span className="font-bold text-red-600">{stats.overdue}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
