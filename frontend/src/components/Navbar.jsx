import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/projects', label: 'Projects', icon: '◫' },
  { to: '/team', label: 'Team', icon: '◎', adminOnly: true },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const links = navLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo + Desktop nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-indigo-700 transition-colors">
              T
            </div>
            <span className="font-bold text-gray-900 text-lg">TaskFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'nav-link-active' : 'nav-link text-gray-500'}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop user section */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
              <p className={`text-xs capitalize mt-0.5 font-medium ${isAdmin ? 'text-indigo-600' : 'text-gray-400'}`}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg"
          >
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
        <div className="px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-gray-100">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className={`text-xs capitalize font-medium ${isAdmin ? 'text-indigo-600' : 'text-gray-400'}`}>
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 font-semibold hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
