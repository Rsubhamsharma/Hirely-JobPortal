import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { JobCardSkeleton } from "../../components/Skeleton";
import toast from "react-hot-toast";
import { Plus, MapPin, Briefcase, Clock } from "lucide-react";

function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  // Applicant view filters
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    responsibilities: "",
    skills: "",
    experience: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (location.state?.editMode && location.state?.jobData) {
      const job = location.state.jobData;
      setEditMode(true);
      setEditingJobId(job._id);
      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        salary: job.salary || "",
        jobType: job.jobType || "Full-time",
        responsibilities: job.responsibilities || "",
        skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
        experience: job.experience || ""
      });
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.editMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(Boolean);

      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        salary: Number(formData.salary),
        jobType: formData.jobType,
        responsibilities: formData.responsibilities,
        skills: skillsArray,
        experience: formData.experience
      };

      let res;
      if (editMode && editingJobId) {
        res = await api.patch(`/jobs/job/${editingJobId}`, jobData);
        toast.success("Job updated successfully!");
      } else {
        res = await api.post("/jobs/postjob", jobData);
        toast.success("Job posted successfully!");
      }

      if (res.data.success) {
        setShowForm(false);
        setEditMode(false);
        setEditingJobId(null);
        setFormData({
          title: "",
          description: "",
          location: "",
          salary: "",
          jobType: "Full-time",
          responsibilities: "",
          skills: "",
          experience: ""
        });
        fetchJobs();
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'post'} job`);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      if (res.data.success) {
        setJobs(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    const loadingToast = toast.loading("Deleting job...");
    try {
      const res = await api.delete(`/jobs/job/${jobId}`);
      if (res.data.success) {
        toast.success("Job deleted successfully!", { id: loadingToast });
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(error.response?.data?.message || "Failed to delete job", { id: loadingToast });
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const loadingToast = toast.loading("Updating job status...");

    try {
      const res = await api.patch(`/jobs/job/${jobId}/toggle-status`);
      if (res.data.success) {
        toast.success(`Job marked as ${newStatus}!`, { id: loadingToast });
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error(error.response?.data?.message || "Failed to update job status", { id: loadingToast });
    }
  };

  // Recruiter View - Post Jobs
  if (user?.role === "recruiter") {
    const myJobs = jobs.filter(job => job.postedBy?._id === user?._id);
    const activeJobs = myJobs.filter(job => job.status === 'active');
    const inactiveJobs = myJobs.filter(job => job.status === 'inactive');
    const closedJobs = myJobs.filter(job => job.status === 'closed');
    const totalApplications = myJobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);

    const displayJobs = activeTab === "active" ? [...activeJobs, ...inactiveJobs] : closedJobs;

    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-900">
        <Navbar />

        {/* Minimal Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post Jobs</h1>
              <button
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                onClick={() => {
                  setEditMode(false);
                  setEditingJobId(null);
                  setFormData({
                    title: "",
                    description: "",
                    location: "",
                    salary: "",
                    jobType: "Full-time",
                    responsibilities: "",
                    skills: "",
                    experience: ""
                  });
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Job Posting Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center z-10">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editMode ? "Edit Job" : "Post New Job"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setEditingJobId(null);
                      setFormData({
                        title: "",
                        description: "",
                        company: "",
                        location: "",
                        salary: "",
                        jobType: "Full-time",
                        companydetails: "",
                        responsibilities: "",
                        skills: "",
                        experience: ""
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handlePostJob} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Job Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g. Senior React Developer"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g. Mumbai, India"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Salary (₹/year) *</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g. 1200000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Job Type *</label>
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Experience Required *</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g. 3-5 years"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                      placeholder="Describe the role..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Responsibilities *</label>
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                      placeholder="Key responsibilities..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Skills Required * (comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="e.g. React, Node.js, MongoDB"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditMode(false);
                        setEditingJobId(null);
                        setFormData({
                          title: "",
                          description: "",
                          location: "",
                          salary: "",
                          jobType: "Full-time",
                          responsibilities: "",
                          skills: "",
                          experience: ""
                        });
                      }}
                      className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (editMode ? "Updating..." : "Posting...") : (editMode ? "Update" : "Post Job")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Active Jobs</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeJobs.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Applicants</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalApplications}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Jobs</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{myJobs.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Closed Jobs</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{closedJobs.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "active"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                Active Jobs ({activeJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("closed")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "closed"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                Closed ({closedJobs.length})
              </button>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : displayJobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No {activeTab} jobs
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {activeTab === "active" ? "Post your first job to get started" : "No closed jobs yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayJobs.map((job) => {
                const postedDate = new Date(job.createdAt);
                const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.jobType}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Posted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Stats */}
                      <div className="flex gap-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{job.applications?.length || 0}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Applicants</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Shortlisted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Interviewed</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Status & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${job.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : job.status === 'inactive'
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                        }`}>
                        {job.status === 'active' ? 'Active' : job.status === 'inactive' ? 'Inactive' : 'Closed'}
                      </span>

                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/employee/jobs/${job._id}`)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(true);
                            setEditingJobId(job._id);
                            setFormData({
                              title: job.title,
                              description: job.description,
                              location: job.location,
                              salary: job.salary,
                              jobType: job.jobType,
                              responsibilities: job.responsibilities || "",
                              skills: job.skills?.join(", ") || "",
                              experience: job.experience
                            });
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        {job.status !== 'closed' && (
                          <button
                            onClick={() => handleToggleStatus(job._id, job.status)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${job.status === 'active'
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                          >
                            {job.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Applicant View - Find Jobs
  // Get unique locations
  const locations = ["all", ...new Set(jobs.map(job => job.location).filter(Boolean))];

  // Filter and sort jobs
  const getFilteredAndSortedJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
      const matchesLocation = locationFilter === "all" || job.location === locationFilter;
      return matchesSearch && matchesJobType && matchesLocation;
    });

    // Sort
    if (sortBy === "salary-high") {
      filtered.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else if (sortBy === "salary-low") {
      filtered.sort((a, b) => (a.salary || 0) - (b.salary || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const displayedJobs = getFilteredAndSortedJobs();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-900">
      <Navbar />

      {/* Minimal Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Explore Opportunities
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Discover roles that match your skills and aspirations
          </p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search by title, company, skills..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Location */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
            >
              <option value="all">All Locations</option>
              {locations.slice(1).map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Job Type Pills */}
            <div className="flex gap-2">
              {["all", "Full-time", "Part-time", "Internship", "Remote"].map(type => (
                <button
                  key={type}
                  onClick={() => setJobTypeFilter(type)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${jobTypeFilter === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                    }`}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
            >
              <option value="recent">Most Recent</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedJobs.map((job) => {
              const postedDate = new Date(job.createdAt);
              const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={job._id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 pr-4">
                      {job.title}
                    </h3>
                    <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Company & Recruiter Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {job.profile?.companyLogo ? (
                      <img
                        src={job.profile.companyLogo}
                        alt={job.profile.companyName || job.company}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                          {(job.profile?.companyName || job.company)?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-base">
                        {job.profile?.companyName || job.company}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </p>
                    </div>
                  </div>

                  {/* Posted By */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Posted by <span className="font-medium text-slate-600 dark:text-slate-300">{job.postedBy?.fullname || 'Recruiter'}</span>
                  </p>

                  {/* Divider */}
                  <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                  {/* Details Row */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{job.salary?.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 border-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 rounded-md font-medium">
                      {job.jobType}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Posted: {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/employee/jobs/${job._id}`)}
                      className="px-5 py-2.5 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
