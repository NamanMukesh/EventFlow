import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/events" 
            className="text-2xl font-bold text-white hover:text-blue-100 transition flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <img
                src="/eventflow-logo.svg"
                alt="EventFlow Logo"
                className="h-14 w-auto"
              />
              <span className="font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl">
                EventFlow
              </span>
            </div>

          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/events"
              className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/10"
            >
              Events
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/my-bookings"
                  className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                >
                  My Bookings
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin/events"
                    className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/10 bg-white/10"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                <div className="flex items-center gap-2">
                  {user?.role === "admin" && (
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
                      ADMIN
                    </span>
                  )}
                  <span className="text-sm text-white/90 font-medium">
                    {user?.name || user?.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium bg-white/10 text-white rounded-md hover:bg-white/20 transition backdrop-blur-sm border border-white/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 ml-4 pl-4 border-l border-white/20">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded-md hover:bg-blue-50 transition shadow-md"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

