import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { useCompetition, isUserRegistered } from "../../hooks/useCompetitions";
import CompetitionDetailSkeleton from "../../components/skeletons/CompetitionDetailSkeleton";

function CompetitionDetail() {
    const { competitionId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: competition, isLoading: loading, error } = useCompetition(competitionId);

    useEffect(() => {
        if (error) {
            toast.error(error.response?.data?.message || "Failed to load competition details");
        }
    }, [error]);

    const status = isUserRegistered(competition, user?._id) ? "Registered" : "Not Registered";

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-red-100 text-red-600";
            case "upcoming":
                return "bg-blue-100 text-blue-600";
            case "completed":
                return "bg-gray-100 text-gray-600";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "active":
                return "● Live";
            case "upcoming":
                return "Upcoming";
            case "completed":
                return "Completed";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <CompetitionDetailSkeleton />
            </div>
        );
    }

    if (!competition) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-800">Competition not found</h2>
                    <p className="text-slate-500 mt-2">This competition may have been removed or doesn't exist.</p>
                    <Link to="/employee/competitions" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Browse Competitions
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
                    Back to Competitions
                </button>

                {/* Competition Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(competition.status)}`}>
                                    {getStatusLabel(competition.status)}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{competition.title}</h1>
                            <p className="text-lg text-slate-600">
                                Organized by <span className="font-medium text-slate-800">{competition.organizer?.fullname || competition.organizer?.email || "Unknown"}</span>
                            </p>
                        </div>

                        {/* Register Button for applicants */}
                        {user?.role === "applicant" && competition.status === "active" &&

                            (
                                <div className="flex-shrink-0">
                                    {status === "Not Registered" &&
                                        <button
                                            onClick={() => navigate(`/employee/competitions/register/${competitionId}`)}
                                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Register Now
                                        </button>
                                    }
                                    {status === "Registered" &&
                                        <button
                                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Registered
                                        </button>
                                    }
                                </div>
                            )}
                    </div>

                    {/* Competition Meta */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100">
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Date</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {new Date(competition.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <p className="text-xs text-green-600 uppercase font-semibold mb-2">Prize Pool</p>
                            <p className="text-2xl font-bold text-green-600">
                                {competition.prize || "TBA"}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Status</p>
                            <p className="text-2xl font-bold text-blue-600 capitalize">
                                {competition.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Competition Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">About this Competition</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Participate in this exciting competition organized by {competition.organizer?.fullname || "our team"}.
                        The competition is scheduled for {new Date(competition.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}.
                        {competition.prize && ` Compete for a prize pool of ${competition.prize}!`}
                    </p>
                </div>

                {/* Organizer Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Organizer</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {competition.organizer?.fullname?.[0] || "O"}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">
                                {competition.organizer?.fullname || "Unknown Organizer"}
                            </p>
                            <p className="text-slate-500">{competition.organizer?.email}</p>
                            {competition.organizer?.role && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium capitalize">
                                    {competition.organizer.role}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Registered Applicants - Only visible to organizer */}
                {user?.role === 'recruiter' && competition.organizer?._id === user?._id && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">
                                Registered Participants
                                <span className="ml-2 text-sm font-normal text-slate-500">
                                    ({competition.applicants?.length || 0})
                                </span>
                            </h2>
                        </div>

                        {!competition.applicants || competition.applicants.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl">
                                <div className="text-4xl mb-2">👥</div>
                                <p className="text-slate-500">No participants registered yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {competition.applicants.map((applicant, index) => (
                                    <div key={applicant._id || index} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {typeof applicant === 'object'
                                                    ? applicant.fullname?.[0]?.toUpperCase() || "A"
                                                    : "A"
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {typeof applicant === 'object'
                                                        ? applicant.fullname || "Applicant"
                                                        : `Participant ${index + 1}`
                                                    }
                                                </p>
                                                {typeof applicant === 'object' && applicant.email && (
                                                    <p className="text-sm text-slate-500">{applicant.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            ✓ Registered
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompetitionDetail;
