import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold hover:bg-indigo-500 transition-colors">
              T
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TaskFlow</h1>
              <p className="text-xs text-indigo-300">Team Task Manager</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-5 sm:mb-6">Join your team on TaskFlow</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{f.label}</label>
                <input
                  type={f.type} name={f.name} value={form[f.name]}
                  onChange={handleChange} required placeholder={f.placeholder}
                  minLength={f.name === 'password' ? 6 : undefined}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-white/20 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select
                name="role" value={form.role} onChange={handleChange}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-white/20 transition-all cursor-pointer"
              >
                <option value="member">Member — View &amp; update assigned tasks</option>
                <option value="admin">Admin — Full access to manage team &amp; projects</option>
              </select>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5 sm:mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
