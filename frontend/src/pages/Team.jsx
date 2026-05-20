import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Team() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    API.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
      toast.success('Role updated!');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Remove this user from the system?')) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete user'); }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const members = users.filter((u) => u.role === 'member');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} total · {admins.length} admin{admins.length !== 1 ? 's' : ''} · {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Summary cards — mobile friendly */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total', value: users.length, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Admins', value: admins.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Members', value: members.length, color: 'bg-teal-50 text-teal-700' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 sm:p-4 text-center hover:shadow-sm transition-shadow`}>
              <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="card overflow-hidden hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                            {u.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{u.name}</span>
                          {u._id === user?._id && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:opacity-80 transition-all ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-xs text-gray-300 hover:text-red-500 font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-12 text-gray-400">No users found</div>}
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {users.map((u) => (
                <div key={u._id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                          {u._id === user?._id && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">You</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-xs text-gray-300 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="card p-10 text-center text-gray-400">No users found</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
