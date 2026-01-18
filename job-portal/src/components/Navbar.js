import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCallback } from "react";

import api from "../api/axios";
import { useSocket } from "../context/SocketContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/messages/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (error) { }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);


  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', fetchUnreadCount);
    socket.on('messages_read', fetchUnreadCount);

    return () => {
      socket.off('new_message', fetchUnreadCount);
      socket.off('messages_read', fetchUnreadCount);
    };
  }, [socket, fetchUnreadCount]);




  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="hidden sm:block text-xl font-brand font-bold tracking-brand text-indigo-600 dark:text-white">
              Hire<span className="text-green-500">ly</span>
            </span>
          </Link>

          {/* Desktop Navigation - LinkedIn Style */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs font-medium">Home</span>
                </NavLink>

                {user.role === 'applicant' && (
                  <>
                    <NavLink
                      to="/employee/jobs"
                      className={({ isActive }) =>
                        `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Jobs</span>
                    </NavLink>

                    <NavLink
                      to="/employee/my-applications"
                      className={({ isActive }) =>
                        `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-medium">Applications</span>
                    </NavLink>
                  </>
                )}

                {user.role === 'recruiter' && (
                  <NavLink
                    to="/employee/jobs"
                    className={({ isActive }) =>
                      `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium">Post Jobs</span>
                  </NavLink>
                )}

                <NavLink
                  to="/employee/competitions"
                  className={({ isActive }) =>
                    `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-xs font-medium">Competitions</span>
                </NavLink>

                <NavLink
                  to="/employee/messages"
                  className={({ isActive }) =>
                    `flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors relative ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-xs font-medium">Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <ThemeToggle />
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  to="/employee/profile"
                  className="flex flex-col items-center px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mb-0.5">
                    {user.fullname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium">Me</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Home</NavLink>
                {user.role === 'applicant' && (
                  <>
                    <NavLink to="/employee/jobs" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Find Jobs</NavLink>
                    <NavLink to="/employee/my-applications" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Applications</NavLink>
                  </>
                )}
                {user.role === 'recruiter' && <NavLink to="/employee/jobs" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Post Jobs</NavLink>}
                <NavLink to="/employee/competitions" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Competitions</NavLink>
                <NavLink to="/employee/messages" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium relative ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  Messages {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>}
                </NavLink>
                <NavLink to="/employee/profile" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Profile</NavLink>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800"><ThemeToggle /></div>
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400">Logout</button>
              </>
            ) : (
              <>
                <div className="pb-2"><ThemeToggle /></div>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
