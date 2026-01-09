import React, { useState, useEffect } from "react";
import api from '../../api/axios.js'
import Navbar from "../../components/Navbar.js";
import toast from "react-hot-toast";

function Competitions() {
  // State for competitions data
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [submitting, setSubmitting] = useState(false);

  // Fetch all competitions on component mount
  useEffect(() => {
    fetchCompetitions();
  }, []);

  // GET - Fetch all competitions
  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/competitions");
      setCompetitions(response.data.data);
    } catch (err) {
      console.error("Error fetching competitions:", err);
      setError(err.response?.data?.message || "Failed to fetch competitions");
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  // GET - Fetch single competition by ID
  const fetchCompetitionById = async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}`);
      return response.data.data;
    } catch (err) {
      console.error("Error fetching competition:", err);
      throw err;
    }
  };

  // POST - Create new competition
  const createCompetition = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.post("/competitions/create", formData);
      setCompetitions(prev => [...prev, response.data.data]);
      resetForm();
      toast.success("Competition created successfully!");
    } catch (err) {
      console.error("Error creating competition:", err);
      toast.error(err.response?.data?.message || "Failed to create competition");
    } finally {
      setSubmitting(false);
    }
  };

  // PATCH - Update existing competition
  const updateCompetition = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.patch(`/competitions/${editingId}`, formData);
      setCompetitions(competitions.map(comp =>
        comp._id === editingId ? response.data.data : comp
      ));
      resetForm();
      toast.success("Competition updated successfully!");
    } catch (err) {
      console.error("Error updating competition:", err);
      toast.error(err.response?.data?.message || "Failed to update competition");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE - Remove competition
  const deleteCompetition = async (competitionId) => {

    try {
      setLoading(true)
      await api.delete(`/competitions/${competitionId}`);

      setCompetitions(competitions.filter(comp => comp._id !== competitionId));
      setTimeout(() => { setLoading(false) }, 1000)

    } catch (err) {
      console.error("Error deleting competition:", err);
      toast.error(err.response?.data?.message || "Failed to delete competition");
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
      <div className="flex bg-slate-50 min-h-screen p-8 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex bg-slate-50 min-h-screen p-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Competitions</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              + Create Competition
            </button>
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
                <div key={comp._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{comp.title}</h3>
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

                  <div className="flex items-center gap-2">
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
                    {comp.organizer?.role === 'applicant' && <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                      Register
                    </button>}
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
