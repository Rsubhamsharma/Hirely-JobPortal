import { useAuth } from "../context/AuthContext";
// ... existing imports
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuth(); // Get user and logout from context


  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
              Job<span className="text-blue-600">Portal</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/employee/jobs">Find Jobs</NavLink>
            {/* Removed broken companies link */}
            {user && <NavLink to="/employee/profile">Dashboard</NavLink>}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Home</Link>
            {user && <Link to="/employee/jobs" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Find Jobs</Link>}
            {user && <Link to="/employee/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Dashboard</Link>}

            {!user ? (
              <>
                <Link to="/login" className="block w-full text-center mt-4 px-5 py-3 text-base font-medium text-white bg-blue-600 rounded-lg">Login</Link>
                <Link to="/signup" className="block w-full text-center mt-4 px-5 py-3 text-base font-medium text-white bg-blue-600 rounded-lg">Register</Link>
              </>
            ) : (
              <button onClick={logout} className="block w-full text-center mt-4 px-5 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg">Logout</button>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
