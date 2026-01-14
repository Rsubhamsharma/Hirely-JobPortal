import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { StatsCardSkeleton, ApplicationCardSkeleton } from "../../components/Skeleton";
import toast from "react-hot-toast";

function JobApplications() {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState(null);
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

    const fetchJobAndApplications = useCallback(async () => {
        try {
            // Fetch job details
            const jobRes = await api.get(`/jobs/getjob/${jobId}`);
            if (jobRes.data.success) {
                setJob(jobRes.data.data);
            }

            // Fetch applications for this job
            const appRes = await api.get(`/applications/job/${jobId}`);
            if (appRes.data.success) {
                setApplications(appRes.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobAndApplications();
    }, [fetchJobAndApplications]);

    const updateStatus = async (applicationId, newStatus) => {
        setUpdatingId(applicationId);
        try {
            const res = await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
            if (res.data.success) {
                setApplications(prev =>
                    prev.map(app =>
                        app._id === applicationId ? { ...app, status: newStatus } : app
                    )
                );
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    // Calculate analytics
    const analytics = {
        total: applications.length,
        pending: applications.filter(app => app.status === "Pending").length,
        viewed: applications.filter(app => app.status === "Viewed").length,
        shortlisted: applications.filter(app => app.status === "Shortlisted").length,
        rejected: applications.filter(app => app.status === "Rejected").length,
        hired: applications.filter(app => app.status === "Hired").length,
    };

    // Filter applications
    const filteredApplications = filter === "all"
        ? applications
        : applications.filter(app => app.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Viewed": return "bg-blue-100 text-blue-700 border-blue-300";
            case "Shortlisted": return "bg-green-100 text-green-700 border-green-300";
            case "Rejected": return "bg-red-100 text-red-700 border-red-300";
            case "Hired": return "bg-purple-100 text-purple-700 border-purple-300";
            default: return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-700 dark:bg-slate-900 transition-colors">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <div className="h-8 w-64 bg-slate-200 rounded mb-2 animate-pulse"></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 animate-pulse">
                        <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-64 bg-slate-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {[...Array(5)].map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))}
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-700 dark:bg-slate-900 transition-colors">
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
                    Back to Jobs
                </button>

                {/* Job Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job?.title}</h1>
                            <p className="text-slate-600 dark:text-slate-300">{job?.company} • {job?.location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${job?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {job?.status === 'active' ? '● Active' : '● Closed'}
                            </span>
                            <Link
                                to={`/employee/jobs/${jobId}`}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                            >
                                View Job
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div
                        onClick={() => setFilter("all")}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all  hover:shadow-sm-hover border-2 ${filter === "all" ? "border-blue-500" : "border-transparent"}`}
                    >
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
                    </div>
                    <div
                        onClick={() => setFilter("Pending")}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all  hover:shadow-sm-hover border-2 ${filter === "Pending" ? "border-yellow-500" : "border-transparent"}`}
                    >
                        <div className="text-2xl font-bold text-yellow-600">{analytics.pending}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Pending</div>
                    </div>
                    <div
                        onClick={() => setFilter("Shortlisted")}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all  hover:shadow-sm-hover border-2 ${filter === "Shortlisted" ? "border-green-500" : "border-transparent"}`}
                    >
                        <div className="text-2xl font-bold text-green-600">{analytics.shortlisted}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Shortlisted</div>
                    </div>
                    <div
                        onClick={() => setFilter("Rejected")}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all  hover:shadow-sm-hover border-2 ${filter === "Rejected" ? "border-red-500" : "border-transparent"}`}
                    >
                        <div className="text-2xl font-bold text-red-600">{analytics.rejected}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Rejected</div>
                    </div>
                    <div
                        onClick={() => setFilter("Hired")}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all  hover:shadow-sm-hover border-2 ${filter === "Hired" ? "border-purple-500" : "border-transparent"}`}
                    >
                        <div className="text-2xl font-bold text-purple-600">{analytics.hired}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hired</div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Applications
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
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No applications yet</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                {filter === "all"
                                    ? "No one has applied to this job yet."
                                    : `No ${filter.toLowerCase()} applications.`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredApplications.map((app) => (
                                <div key={app._id} className="p-6 hover:bg-slate-50 dark:bg-slate-700 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                        {/* Applicant Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {app.applicant?.fullname?.[0]?.toUpperCase() || "A"}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{app.applicant?.fullname || "Applicant"}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{app.applicant?.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Phone</span>
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">{app.phone || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Experience</span>
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">{app.experience || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Expected Salary</span>
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                                        {app.expectedSalary ? `₹${app.expectedSalary.toLocaleString()}` : "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Applied On</span>
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {app.coverLetter && (
                                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                    <span className="text-xs text-slate-400 uppercase font-semibold">Cover Letter</span>
                                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-3">{app.coverLetter}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                            {/* Current Status */}
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>

                                            {/* Status Update Dropdown */}
                                            <select
                                                value={app.status}
                                                onChange={(e) => updateStatus(app._id, e.target.value)}
                                                disabled={updatingId === app._id}
                                                className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                                            >
                                                <option value="Pending">Set as Pending</option>
                                                <option value="Viewed">Set as Viewed</option>
                                                <option value="Shortlisted">Shortlist</option>
                                                <option value="Rejected">Reject</option>
                                                <option value="Hired">Mark as Hired</option>
                                            </select>

                                            {/* Resume Link */}
                                            {app.resume && (
                                                <a
                                                    href={app.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    📄 View Resume
                                                </a>
                                            )}

                                            {/* Message Button */}
                                            <button
                                                onClick={() => startConversation(app._id)}
                                                disabled={startingChat === app._id}
                                                className="w-full px-4 py-2 bg-slate-800 text-white text-center rounded-lg font-medium hover:bg-slate-900 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {startingChat === app._id ? 'Starting...' : 'Message'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobApplications;
