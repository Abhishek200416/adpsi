import { Link, useNavigate } from 'react-router-dom';
import { Wind, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar = ({ isAdmin = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" data-testid="logo-link">
            <div className="bg-gradient-to-br from-teal-700 to-teal-600 p-2 rounded-full">
              <Wind className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 font-['Manrope']">
              Delhi Air Command
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!isAdmin ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-dashboard-link"
                >
                  Dashboard
                </Link>
                <Link
                  to="/prediction"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-prediction-link"
                >
                  Predictions
                </Link>
                <Link
                  to="/directions"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-directions-link"
                >
                  Get Directions
                </Link>
                <Link
                  to="/about"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-about-link"
                >
                  About
                </Link>
                <Link
                  to="/report"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-report-link"
                >
                  Report Issue
                </Link>
                <Link
                  to="/admin/login"
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 py-2 font-medium transition-all shadow-lg hover:shadow-xl"
                  data-testid="nav-admin-login-link"
                >
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-slate-700 hover:text-teal-700 font-medium transition-colors"
                  data-testid="nav-admin-dashboard-link"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-full px-6 py-2 font-medium transition-all"
                  data-testid="logout-button"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200" data-testid="mobile-menu">
            {!isAdmin ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-dashboard-link"
                >
                  Dashboard
                </Link>
                <Link
                  to="/prediction"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-prediction-link"
                >
                  Predictions
                </Link>
                <Link
                  to="/directions"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-directions-link"
                >
                  Get Directions
                </Link>
                <Link
                  to="/about"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-about-link"
                >
                  About
                </Link>
                <Link
                  to="/report"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-report-link"
                >
                  Report Issue
                </Link>
                <Link
                  to="/admin/login"
                  className="block mt-2 py-2 text-center bg-slate-900 text-white rounded-full"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-admin-login-link"
                >
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block py-2 text-slate-700 hover:text-teal-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-admin-dashboard-link"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full mt-2 py-2 text-center bg-red-600 text-white rounded-full"
                  data-testid="mobile-logout-button"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};