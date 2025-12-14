import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiUpload, FiSearch, FiFileText, FiBriefcase, FiMenu, FiX, } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/upload', icon: FiUpload, label: 'Upload' },
    { path: '/match', icon: FiSearch, label: 'Match' },
    { path: '/jobs', icon: FiBriefcase, label: 'Jobs' },
    { path: '/history', icon: FiFileText, label: 'History' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
              <FiBriefcase className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold gradient-text">Resume Builder</span>
          </Link>

          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/builder"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/builder')
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >

                  <span className="font-medium">Builder</span>
                </Link>
              </div>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut />
                  <span className="font-medium">Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-in">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/builder"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/builder')
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">Builder</span>
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <FiUser />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <FiLogOut />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
