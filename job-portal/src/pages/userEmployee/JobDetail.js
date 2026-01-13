import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

function JobDetail() {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    // Application form state
    const [applicationForm, setApplicationForm] = useState({
        phone: "",
        coverLetter: "",
        expectedSalary: "",
        experience: "",
        resume: null
    });

    const fetchJobDetails = useCallback(async () => {
        try {
            const res = await api.get(`/jobs/getjob/${jobId}`);
            if (res.data.success) {
                setJob(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching job:", error);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    const checkIfApplied = useCallback(async () => {
        try {
            const res = await api.get("/applications/my");
            if (res.data.success) {
                const applied = res.data.data.some(app => app.job?._id === jobId);
                setHasApplied(applied);
            }
        } catch (error) {
            console.error("Error checking application status:", error);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobDetails();
        if (user?.role === "applicant") {
            checkIfApplied();
        }
    }, [fetchJobDetails, checkIfApplied, user?.role]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setApplicationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setApplicationForm(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);

        try {
            const formData = new FormData();
            formData.append("phone", applicationForm.phone);
            formData.append("coverLetter", applicationForm.coverLetter);
            formData.append("expectedSalary", applicationForm.expectedSalary);
            formData.append("experience", applicationForm.experience);
            if (applicationForm.resume) {
                formData.append("resume", applicationForm.resume);
            }

            const res = await api.post(`/applications/apply/${jobId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                toast.success("Application submitted successfully!");
                setShowApplyModal(false);
                setHasApplied(true);
            }
        } catch (error) {
            console.error("Error applying:", error);
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-64 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-800">Job not found</h2>
                    <p className="text-slate-500 mt-2">This job may have been removed or doesn't exist.</p>
                    <Link to="/employee/jobs" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </button>

                {/* Job Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {job.status === 'active' ? '● Active' : '● Closed'}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {job.jobType}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                            <p className="text-xl text-slate-600 font-medium">{job.company}</p>
                        </div>

                        {/* Apply Button */}
                        {user?.role === "applicant" && job.status === "active" && (
                            <div className="flex-shrink-0">
                                {hasApplied ? (
                                    <button
                                        disabled
                                        className="px-8 py-3 bg-green-100 text-green-700 font-semibold rounded-xl cursor-not-allowed"
                                    >
                                        ✓ Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Edit Job Button for Recruiters */}
                        {user?.role === "recruiter" && job.postedBy?._id === user?._id && (
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => {
                                        // Navigate to Jobs page with job data for editing
                                        navigate('/employee/jobs', {
                                            state: {
                                                editMode: true,
                                                jobData: job
                                            }
                                        });
                                    }}
                                    className="px-8 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Edit Job
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Job Meta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Location</p>
                            <p className="text-slate-700 font-medium flex items-center gap-2">
                                <span>📍</span> {job.location}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Salary</p>
                            <p className="text-slate-700 font-medium flex items-center gap-2">
                                <span>💰</span> ₹{job.salary?.toLocaleString()} / year
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Experience</p>
                            <p className="text-slate-700 font-medium flex items-center gap-2">
                                <span>📅</span> {job.experience}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Posted By</p>
                            <p className="text-slate-700 font-medium flex items-center gap-2">
                                <span>👤</span> {job.postedBy?.fullname || "Recruiter"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>

                {job.responsibilities && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Responsibilities</h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
                    </div>
                )}

                {job.skills && job.skills.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {job.companydetails && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">About {job.company}</h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.companydetails}</p>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Apply to {job.title}</h2>
                                <p className="text-slate-500 text-sm">{job.company}</p>
                            </div>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleApply} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={applicationForm.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="+91 9876543210"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Resume (PDF) *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Expected Salary (₹/year)
                                </label>
                                <input
                                    type="number"
                                    name="expectedSalary"
                                    value={applicationForm.expectedSalary}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. 1200000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Years of Experience
                                </label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={applicationForm.experience}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. 3 years"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Cover Letter
                                </label>
                                <textarea
                                    name="coverLetter"
                                    value={applicationForm.coverLetter}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Tell us why you're a great fit for this role..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetail;
