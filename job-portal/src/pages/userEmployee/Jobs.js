import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { JobCardSkeleton } from "../../components/Skeleton";
import toast from "react-hot-toast";

function Jobs() {
  const { user } = useAuth(); // Get logged-in user with role
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Form state with all required fields from createJob controller
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle edit mode from navigation state
  useEffect(() => {
    if (location.state?.editMode && location.state?.jobData) {
      const job = location.state.jobData;
      setEditMode(true);
      setEditingJobId(job._id);
      setFormData({
        title: job.title || "",
        description: job.description || "",
        company: job.company || "",
        location: job.location || "",
        salary: job.salary || "",
        jobType: job.jobType || "Full-time",
        companydetails: job.companydetails || "",
        responsibilities: job.responsibilities || "",
        skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
        experience: job.experience || ""
      });
      setShowForm(true);
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.editMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert skills from comma-separated string to array
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(Boolean);

      const jobData = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        salary: Number(formData.salary),
        jobType: formData.jobType,
        companydetails: formData.companydetails,
        responsibilities: formData.responsibilities,
        skills: skillsArray,
        experience: formData.experience
      };

      let res;
      if (editMode && editingJobId) {
        // Update existing job
        res = await api.patch(`/jobs/job/${editingJobId}`, jobData);
        toast.success("Job updated successfully!");
      } else {
        // Create new job
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
          company: "",
          location: "",
          salary: "",
          jobType: "Full-time",
          companydetails: "",
          responsibilities: "",
          skills: "",
          experience: ""
        });
        fetchJobs(); // Refresh the jobs list
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

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recruiter View - Post Jobs
  if (user?.role === "recruiter") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-700 font-sans transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Post <span className="text-blue-600">Jobs</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Create job listings to find the perfect candidates for your company.
            </p>
            <button
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all  shadow-lg hover:shadow-xl"
              onClick={() => {
                // Reset edit mode and clear form before opening
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
                setShowForm(true);
              }}
            >
              + Post a New Job
            </button>
          </div>

          {/* Job Posting Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editMode ? "Edit Job" : "Post a New Job"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setEditingJobId(null);
                      // Reset form data when closing
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
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handlePostJob} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g. Senior React Developer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g. Tech Corp"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g. Mumbai, India"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Salary (₹/year) *</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g. 1200000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Job Type *</label>
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience Required *</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g. 3-5 years"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Describe the role and what the candidate will be doing..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Details *</label>
                    <textarea
                      name="companydetails"
                      value={formData.companydetails}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Brief description about your company..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsibilities *</label>
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="List the key responsibilities for this role..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills Required * (comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. React, Node.js, MongoDB, TypeScript"
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
                        // Reset form data when canceling
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
                      className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all "
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (editMode ? "Updating..." : "Posting...") : (editMode ? "Update Job" : "Post Job")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Show recruiter's posted jobs */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Posted Jobs</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.filter(job => job.postedBy?._id === user?._id).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-slate-800">No jobs posted yet</h3>
                <p className="text-slate-500 mt-2">Start by posting your first job listing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.filter(job => job.postedBy?._id === user?._id).map((job) => (
                  <div key={job._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all ">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">{job.company}</p>
                    <p className="text-slate-600 text-sm mt-1">📍 {job.location}</p>

                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
                        {job.applications?.length || 0} Applications
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/employee/jobs/${job._id}`)}
                        className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                      >
                        View Job
                      </button>
                      <button
                        onClick={() => navigate(`/employee/jobs/${job._id}/applications`)}
                        className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Applications
                      </button>
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

  // Applicant View - Find Jobs
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 font-sans transition-colors">
      <Navbar />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header & Search */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Explore <span className="text-blue-600">Opportunities</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Discover roles that match your skills and aspirations from top companies.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              placeholder="Search by job title or company..."
              className="w-full h-11 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800">No jobs found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 flex flex-col h-full">
                <div className="mb-3">
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 flex-1">
                  <span>₹{job.salary}</span>
                  <span>•</span>
                  {job.jobType && (
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[11px]">
                      {job.jobType}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/employee/jobs/${job._id}`)}
                  className="w-full px-3 py-1.5 bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
