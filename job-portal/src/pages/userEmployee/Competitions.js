import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Plus, Trophy, Users, Search, ChevronDown, Bookmark, CheckCircle2, Clock } from "lucide-react";
import { useCompetitions, useCreateCompetition, useUpdateCompetition, useDeleteCompetition, isUserRegistered } from "../../hooks/useCompetitions";
import CompetitionListSkeleton from "../../components/skeletons/CompetitionListSkeleton";

const Competitions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: competitions = [], isLoading: loading, error: queryError, refetch } = useCompetitions();
  const createMutation = useCreateCompetition();
  const updateMutation = useUpdateCompetition();
  const deleteMutation = useDeleteCompetition();

  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (queryError) {
      setError(queryError.response?.data?.message || "Failed to fetch competitions");
    }
  }, [queryError]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    prize: "",
    status: "active"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const fetchCompetitions = () => {
    refetch();
  };

  const userRole = user?.role;

  const createCompetition = async (e) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => resetForm()
    });
  };

  const updateCompetition = async (e) => {
    e.preventDefault();
    updateMutation.mutate({ competitionId: editingId, formData }, {
      onSuccess: () => resetForm()
    });
  };

  const deleteCompetition = async (competitionId) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      deleteMutation.mutate(competitionId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (comp) => {
    setFormData({
      title: comp.title,
      date: comp.date,
      prize: comp.prize || "",
      status: comp.status
    });
    setEditingId(comp._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: "", date: "", prize: "", status: "active" });
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || comp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate analytics
  const stats = {
    total: competitions.length,
    active: competitions.filter(c => c.status === 'active').length,
    totalParticipants: competitions.reduce((sum, comp) => sum + (comp.applicants?.length || 0), 0)
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        border: "border-emerald-500",
        text: "text-emerald-700 dark:text-emerald-400",
        label: "Active"
      },
      upcoming: {
        border: "border-blue-500",
        text: "text-blue-700 dark:text-blue-400",
        label: "Upcoming"
      },
      completed: {
        border: "border-slate-400",
        text: "text-slate-600 dark:text-slate-400",
        label: "Completed"
      }
    };
    return badges[status] || badges.active;
  };

  const getDaysRemaining = (dateString) => {
    const compDate = new Date(dateString);
    const today = new Date();
    const diffTime = compDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Ended";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  if (loading) {
    return <CompetitionListSkeleton />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Minimal Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Competitions & Challenges</h1>
              {userRole !== "applicant" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search competitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm font-medium cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Competitions</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Competitions</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalParticipants}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={fetchCompetitions}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Create/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEditing ? "Edit Competition" : "Create Competition"}
                  </h3>
                </div>
                <form onSubmit={isEditing ? updateCompetition : createCompetition} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., Hackathon 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Prize Pool
                      </label>
                      <input
                        type="text"
                        name="prize"
                        value={formData.prize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., $10,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : (isEditing ? "Update" : "Create")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Competitions Grid */}
          {filteredCompetitions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No competitions found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to create a competition"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCompetitions.map((comp) => {
                const statusBadge = getStatusBadge(comp.status);
                const isRegistered = isUserRegistered(comp, user?._id);
                const isOrganizer = user?.role === 'recruiter' && comp.organizer?._id === user?._id;
                const daysLeft = getDaysRemaining(comp.date);

                return (
                  <div
                    key={comp._id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Card Content */}
                    <div className="p-6">
                      {/* Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`inline-block px-3 py-1 border-2 ${statusBadge.border} ${statusBadge.text} rounded-md text-xs font-semibold`}>
                          {statusBadge.label}
                        </span>
                        {isOrganizer && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Competition</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => navigate(`/employee/competitions/${comp._id}`)}
                        className="text-lg font-bold text-slate-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
                      >
                        {comp.title}
                      </h3>

                      {/* Organization */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {comp.organizer?.fullname || comp.organizer?.email || "Unknown"}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-6 mb-5 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>{comp.applicants?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Trophy className="w-4 h-4" />
                          <span>{comp.prize || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>{daysLeft}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {user?.role === 'applicant' ? (
                          <>
                            {isRegistered ? (
                              <div className="flex-1 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold text-center text-sm border border-emerald-200 dark:border-emerald-800">
                                Registered
                              </div>
                            ) : comp.status === 'active' ? (
                              <button
                                onClick={() => navigate(`/employee/competitions/register/${comp._id}`)}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                              >
                                View Competition
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/employee/competitions/${comp._id}`)}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                              >
                                View Competition
                              </button>
                            )}
                            <button className="p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                              <Bookmark className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/employee/competitions/${comp._id}`)}
                              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                            >
                              View Competition
                            </button>
                            {isOrganizer && (
                              <>
                                <button
                                  onClick={() => handleEdit(comp)}
                                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteCompetition(comp._id)}
                                  className="px-4 py-2.5 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Competitions;
