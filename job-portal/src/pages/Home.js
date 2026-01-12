import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";

function Home() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: "Active Jobs", value: "2,500+" },
    { label: "Companies", value: "850+" },
    { label: "Candidates", value: "15k+" },
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch recent jobs
      const jobsRes = await api.get("/jobs");
      if (jobsRes.data.success) {
        setRecentJobs(jobsRes.data.data.slice(0, 3) || []);
      }

      // Fetch my applications (for applicants)
      if (user?.role === "applicant") {
        try {
          const appsRes = await api.get("/applications/my");
          if (appsRes.data.success) {
            setMyApplications(appsRes.data.data || []);
          }
        } catch (e) {
          // Applications API might fail for new users
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate application stats for applicants
  const appStats = {
    total: myApplications.length,
    pending: myApplications.filter(a => a.status === "Pending").length,
    shortlisted: myApplications.filter(a => a.status === "Shortlisted").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {user ? (
            // Logged in hero
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Welcome back, <span className="text-blue-400">{user.fullname?.split(" ")[0]}</span>! 👋
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-8 leading-relaxed">
                {user.role === "applicant"
                  ? "Continue your job search and track your applications."
                  : "Manage your job postings and find the perfect candidates."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user.role === "applicant" ? (
                  <>
                    <Link
                      to="/employee/jobs"
                      className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                    >
                      Browse Jobs
                    </Link>
                    <Link
                      to="/employee/my-applications"
                      className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/20"
                    >
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/employee/jobs"
                      className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                    >
                      Manage Jobs
                    </Link>
                    <Link
                      to="/employee/profile"
                      className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/20"
                    >
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            // Guest hero
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                Find Your <span className="text-blue-400">Dream Career</span> <br className="hidden md:block" />
                With World Class Companies
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-10 leading-relaxed">
                Connect with top employers and discover opportunities that match your skills.
                Your next big career move starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-transparent border-2 border-slate-500 text-white font-bold rounded-lg hover:bg-slate-800 hover:border-slate-400 transition-all"
                >
                  Join as Recruiter
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Stats for Applicants */}
      {user?.role === "applicant" && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/employee/my-applications" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl group-hover:bg-blue-100 transition-colors">
                    📝
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{appStats.total}</div>
                    <div className="text-slate-500 font-medium">Total Applications</div>
                  </div>
                </div>
              </Link>
              <Link to="/employee/my-applications" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-3xl group-hover:bg-yellow-100 transition-colors">
                    ⏳
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">{appStats.pending}</div>
                    <div className="text-slate-500 font-medium">Pending Review</div>
                  </div>
                </div>
              </Link>
              <Link to="/employee/my-applications" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-3xl group-hover:bg-green-100 transition-colors">
                    ⭐
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{appStats.shortlisted}</div>
                    <div className="text-slate-500 font-medium">Shortlisted</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Jobs Section (for logged in users) */}
      {user && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {user.role === "applicant" ? "Latest Opportunities" : "Recent Job Postings"}
              </h2>
              <Link to="/employee/jobs" className="text-blue-600 font-medium hover:underline">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">No jobs available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentJobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/employee/jobs/${job._id}`}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {job.jobType || "Full-time"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{job.company}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>📍 {job.location || "Remote"}</span>
                      <span>💰 ₹{job.salary?.toLocaleString() || "Competitive"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section (for guests) */}
      {!user && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We provide the best tools and services to help you succeed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: "🚀", title: "Fast Growing", desc: "Thousands of new jobs added daily from top companies worldwide." },
              { icon: "🛡️", title: "Verified Jobs", desc: "We verify every employer to ensure safe and legitimate opportunities." },
              { icon: "🤝", title: "Easy Apply", desc: "Apply to multiple jobs with just one click using your profile." }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (for guests and applicants) */}
      {(!user || user?.role === "applicant") && (
        <section className="py-20 bg-slate-900 sm:mx-6 lg:mx-12 rounded-3xl mb-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {user ? "Want to hire talent?" : "Ready to start your journey?"}
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              {user
                ? "Switch to a recruiter account and start posting jobs."
                : "Join thousands of professionals who have found their dream companies."}
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-white text-slate-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              {user ? "Create Recruiter Account" : "Get Started Free"}
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}

export default Home;
