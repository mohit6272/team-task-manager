import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  active: { label: 'Active', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  'on-hold': { label: 'On Hold', style: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', members: [], status: 'active' });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await API.get('/users'); setAllUsers(res.data); } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', description: '', members: [], status: 'active' });
    setEditProject(null);
    setShowForm(false);
  };

  const handleOpenEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      members: project.members?.map((m) => m._id) || [],
      status: project.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        const res = await API.put(`/projects/${editProject._id}`, form);
        setProjects((prev) => prev.map((p) => (p._id === editProject._id ? res.data : p)));
        toast.success('Project updated!');
      } else {
        const res = await API.post('/projects', form);
        setProjects([res.data, ...projects]);
        toast.success('Project created!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="card p-4 sm:p-6 mb-6 sm:mb-8 border-indigo-100 shadow-md">
            <h2 className="text-base font-bold text-gray-900 mb-4 sm:mb-5">
              {editProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Project Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Website Redesign" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?" rows={3} className="input-field resize-none" />
              </div>
              {allUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Team Members</label>
                  <div className="flex flex-wrap gap-2">
                    {allUsers.map((u) => (
                      <button key={u._id} type="button" onClick={() => toggleMember(u._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                          form.members.includes(u._id)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          form.members.includes(u._id) ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {u.name?.charAt(0)}
                        </span>
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className="btn-primary text-sm">{editProject ? 'Save Changes' : 'Create Project'}</button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 sm:p-16 text-center">
            <div className="text-5xl mb-4">◫</div>
            <p className="text-gray-500 font-medium">No projects found</p>
            {isAdmin && <p className="text-gray-400 text-sm mt-2">Create your first project to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {projects.map((p) => {
              const statusConf = STATUS_CONFIG[p.status] || STATUS_CONFIG.active;
              return (
                <div key={p._id} className="card group p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-100 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${statusConf.style}`}>{statusConf.label}</span>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(p)} className="icon-btn" title="Edit">✎</button>
                        <button onClick={() => handleDelete(p._id)} className="icon-btn-danger" title="Delete">✕</button>
                      </div>
                    )}
                  </div>

                  <Link to={`/projects/${p._id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-1 text-sm sm:text-base">
                      {p.name}
                    </h3>
                  </Link>
                  {p.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-2">{p.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex -space-x-1">
                      {p.members?.slice(0, 5).map((m) => (
                        <div key={m._id}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold hover:scale-110 transition-transform"
                          title={m.name}
                        >
                          {m.name?.charAt(0)}
                        </div>
                      ))}
                      {p.members?.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-[10px] font-bold">
                          +{p.members.length - 5}
                        </div>
                      )}
                      {(!p.members || p.members.length === 0) && (
                        <span className="text-xs text-gray-400">No members</span>
                      )}
                    </div>
                    <Link to={`/projects/${p._id}`}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 hover:underline transition-colors"
                    >
                      View Tasks →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
