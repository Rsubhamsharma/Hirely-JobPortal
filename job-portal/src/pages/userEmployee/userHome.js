import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function UserHome() {
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  const fetchLatestJobs = async () => {
    try {
      const res = await api.get("/jobs");
      if (res.data.success) {
        // Take only first 3 jobs for the dashboard
        setLatestJobs(res.data.data.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarItem = ({ to, icon, label, active }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            J
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Job<span className="text-blue-500">Portal</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem to="/employee/home" icon="🏠" label="Overview" active />
          <SidebarItem to="/employee/jobs" icon="💼" label="Find Jobs" />
          <SidebarItem to="/employee/internships" icon="🎓" label="Internships" />
          <SidebarItem to="/employee/competitions" icon="🏆" label="Competitions" />
          <SidebarItem to="/employee/profile" icon="👤" label="My Profile" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
          >
            <span>Run</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto bg-slate-50 min-h-screen rounded-tl-[2rem]">
        {/* Header (Mobile Sidebar Toggle could go here) */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, <span className="text-blue-600">{user?.fullname?.split(" ")[0]}</span>! 👋
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening correctly.</p>
          </div>
          <Link to="/employee/profile" className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm hover:shadow-md transition-all border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {user?.fullname?.[0] || "U"}
            </div>
            <span className="font-medium text-slate-700 hidden sm:block">My Profile</span>
          </Link>
        </header>

        {/* Profile Completion Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/20 mb-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Complete your profile</h2>
              <p className="text-blue-100 max-w-lg">
                Candidates with complete profiles are 3x more likely to get hired. Add your skills, resume, and experience now.
              </p>
            </div>
            <Link
              to="/employee/profile"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap"
            >
              Complete Profile
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Jobs Applied", value: "0", icon: "📝", color: "blue" },
            { label: "Saved Jobs", value: "0", icon: "🔖", color: "indigo" },
            { label: "Profile Views", value: "0", icon: "👀", color: "emerald" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${stat.color}-50 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Jobs Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Latest Opportunities</h2>
          <Link to="/employee/jobs" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
            View All Jobs
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : latestJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
            <p className="text-slate-500">No jobs posted yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestJobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    {job.type || "Full-time"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">📍 {job.location || "Remote"}</span>
                  <span className="flex items-center gap-1">💰 {job.salary || "Competitive"}</span>
                </div>
                <button className="w-full py-2 bg-slate-50 text-slate-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserHome;
