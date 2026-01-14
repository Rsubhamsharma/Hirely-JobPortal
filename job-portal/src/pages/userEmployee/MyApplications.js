import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { StatsCardSkeleton, ApplicationCardSkeleton } from "../../components/Skeleton";
import toast from "react-hot-toast";

function MyApplications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [startingChat, setStartingChat] = useState(null);

    const startConversation = async (applicationId) => {
        setStartingChat(applicationId);
        try {
            const res = await api.post(`/messages/conversation/${applicationId}`);
            if (res.data.success) {
                const conversationId = res.data.data._id;
                navigate(`/employee/messages?conversation=${conversationId}`);
                toast.success('Opening conversation...');
            }
        } catch (error) {
            toast.error('Failed to start conversation');
        } finally {
            setStartingChat(null);
        }
    };

    const fetchApplications = useCallback(async () => {
        try {
            const res = await api.get("/applications/my");
            if (res.data.success) {
                setApplications(res.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Calculate analytics
    const analytics = {
        total: applications.length,
        pending: applications.filter(app => app.status === "Pending").length,
        viewed: applications.filter(app => app.status === "Viewed").length,
        shortlisted: applications.filter(app => app.status === "Shortlisted").length,
        rejected: applications.filter(app => app.status === "Rejected").length,
        hired: applications.filter(app => app.status === "Hired").length,
    };

    // Calculate success rate
    const successRate = analytics.total > 0
        ? Math.round(((analytics.shortlisted + analytics.hired) / analytics.total) * 100)
        : 0;

    // Filter applications
    const filteredApplications = filter === "all"
        ? applications
        : applications.filter(app => app.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Viewed": return "bg-blue-100 text-blue-700";
            case "Shortlisted": return "bg-green-100 text-green-700";
            case "Rejected": return "bg-red-100 text-red-700";
            case "Hired": return "bg-purple-100 text-purple-700";
            default: return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending": return "⏳";
            case "Viewed": return "👁️";
            case "Shortlisted": return "⭐";
            case "Rejected": return "❌";
            case "Hired": return "🎉";
            default: return "📄";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-800 transition-colors">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <div className="h-8 w-64 bg-slate-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {[...Array(6)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <ApplicationCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 transition-colors">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">My Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track all your job applications in one place</p>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div
                        onClick={() => setFilter("all")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "all" ? "border-blue-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{analytics.total}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total</div>

                    </div>

                    <div
                        onClick={() => setFilter("Pending")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "Pending" ? "border-yellow-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-yellow-600">{analytics.pending}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</div>

                    </div>

                    <div
                        onClick={() => setFilter("Viewed")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "Viewed" ? "border-blue-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-blue-600">{analytics.viewed}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Viewed</div>

                    </div>

                    <div
                        onClick={() => setFilter("Shortlisted")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "Shortlisted" ? "border-green-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-green-600">{analytics.shortlisted}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Shortlisted</div>

                    </div>

                    <div
                        onClick={() => setFilter("Rejected")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "Rejected" ? "border-red-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-red-600">{analytics.rejected}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rejected</div>

                    </div>

                    <div
                        onClick={() => setFilter("Hired")}
                        className={`bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all  hover:shadow-sm-hover ${filter === "Hired" ? "border-purple-500" : "border-transparent"}`}
                    >
                        <div className="text-3xl font-bold text-purple-600">{analytics.hired}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hired</div>

                    </div>
                </div>

                {/* Success Rate Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold opacity-90">Application Success Rate</h3>
                            <p className="text-sm opacity-75">Based on shortlisted and hired applications</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold">{successRate}%</div>
                            <div className="w-24 h-24 relative">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="white"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${successRate * 2.51} 251`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                            {filter === "all" ? "All Applications" : `${filter} Applications`}
                            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                ({filteredApplications.length})
                            </span>
                        </h2>
                        {filter !== "all" && (
                            <button
                                onClick={() => setFilter("all")}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Show All
                            </button>
                        )}
                    </div>

                    {filteredApplications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No applications found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {filter === "all"
                                    ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                                    : `No ${filter.toLowerCase()} applications.`}
                            </p>
                            {filter === "all" && (
                                <Link
                                    to="/employee/jobs"
                                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse Jobs
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredApplications.map((app) => (
                                <div key={app._id} className="p-6 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link
                                                    to={`/employee/jobs/${app.job?._id}`}
                                                    className="text-lg font-semibold text-slate-900 dark:text-slate-50 hover:text-blue-600 transition-colors"
                                                >
                                                    {app.job?.title || "Job Title"}
                                                </Link>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                    {getStatusIcon(app.status)} {app.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 font-medium">{app.job?.company || "Company"}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    📍 {app.job?.location || "Location"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    💰 ₹{app.job?.salary?.toLocaleString() || "N/A"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    📅 Applied {new Date(app.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => startConversation(app._id)}
                                                disabled={startingChat === app._id}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {startingChat === app._id ? 'Starting...' : 'Message'}
                                            </button>
                                            <Link
                                                to={`/employee/jobs/${app.job?._id}`}
                                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                            >
                                                View Job
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                {applications.length > 0 && analytics.rejected > analytics.shortlisted && (
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-amber-800 mb-2">💡 Tips to Improve</h3>
                        <ul className="text-amber-700 space-y-2">
                            <li>• Make sure your resume is up-to-date and tailored for each job</li>
                            <li>• Write personalized cover letters highlighting relevant experience</li>
                            <li>• Complete your profile to 100% for better visibility</li>
                            <li>• Apply to jobs that match your skills and experience level</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyApplications;
