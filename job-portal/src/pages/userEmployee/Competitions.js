import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Plus, Edit2, Trash2, Calendar, Trophy, Users, Search, Filter, MoreVertical, X, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useCompetitions, useCreateCompetition, useUpdateCompetition, useDeleteCompetition, isUserRegistered } from "../../hooks/useCompetitions";
import CompetitionListSkeleton from "../../components/skeletons/CompetitionListSkeleton";

const Competitions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // React Query hooks
  const { data: competitions = [], isLoading: loading, error: queryError, refetch } = useCompetitions();
  const createMutation = useCreateCompetition();
  const updateMutation = useUpdateCompetition();
  const deleteMutation = useDeleteCompetition();

  const [error, setError] = useState(null);

  // Sync query error to local error state if needed
  useEffect(() => {
    if (queryError) {
      setError(queryError.response?.data?.message || "Failed to fetch competitions");
    }
  }, [queryError]);

  // State for create/edit form
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

  // GET - Fetch all competitions
  const fetchCompetitions = () => {
    refetch();
  };

  // GET - Fetch single competition by ID

  const userRole = user?.role;


  // POST - Create new competition
  const createCompetition = async (e) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => resetForm()
    });
  };

  // PATCH - Update existing competition
  const updateCompetition = async (e) => {
    e.preventDefault();
    updateMutation.mutate({ competitionId: editingId, formData }, {
      onSuccess: () => resetForm()
    });
  };

  // DELETE - Remove competition
  const deleteCompetition = async (competitionId) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      deleteMutation.mutate(competitionId);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open edit form with competition data
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

  // Reset form to initial state
  const resetForm = () => {
    setFormData({ title: "", date: "", prize: "", status: "active" });
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  // Loading state
  if (loading) {
    return (
      <CompetitionListSkeleton />
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex bg-slate-50 min-h-screen p-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Competitions</h2>
            {
              userRole !== "applicant" &&
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Create Competition
              </button>
            }
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <button
                onClick={fetchCompetitions}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Create/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  {isEditing ? "Edit Competition" : "Create Competition"}
                </h3>
                <form onSubmit={isEditing ? updateCompetition : createCompetition}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="Competition title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prize Pool</label>
                      <input
                        type="text"
                        name="prize"
                        value={formData.prize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="e.g., $10,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Saving..." : (isEditing ? "Update" : "Create")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Competitions List */}
          <div className="space-y-4">
            {competitions.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
                <p className="text-slate-500 text-lg">No competitions available</p>
                <p className="text-slate-400 mt-2">Create your first competition to get started!</p>
              </div>
            ) : (
              competitions.map((comp) => (
                <div key={comp._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/employee/competitions/${comp._id}`)}>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">{comp.title}</h3>
                      {comp.status === "active" && (
                        <span className="animate-pulse bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          ● Live
                        </span>
                      )}
                      {comp.status === "upcoming" && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Upcoming
                        </span>
                      )}
                      {comp.status === "completed" && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500">
                      Organized by {comp.organizer?.fullname || comp.organizer?.email || "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Date</p>
                      <p className="font-medium text-slate-700">{new Date(comp.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Prize Pool</p>
                      <p className="font-bold text-green-600">{comp.prize || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/employee/competitions/${comp._id}`)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </button>
                    {user?.role === 'recruiter' && comp.organizer?._id === user?._id && (
                      <>
                        <button
                          onClick={() => handleEdit(comp)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCompetition(comp._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        {user.role === "recruiter" && comp.organizer?._id === user?._id &&
                          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
                            👥 {comp.applicants?.length || 0} Registered
                          </span>
                        }
                      </>
                    )}
                    {user?.role === 'applicant' && (
                      isUserRegistered(comp, user?._id) ? (
                        <span className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-1">
                          ✅ Registered
                        </span>
                      ) : comp.status === 'active' ? (
                        <button
                          onClick={() => navigate(`/employee/competitions/register/${comp._id}`)}
                          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                          Register
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                          Closed
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={fetchCompetitions}
              disabled={loading}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors disabled:opacity-50"
            >
              ↻ Refresh Competitions
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Competitions;
