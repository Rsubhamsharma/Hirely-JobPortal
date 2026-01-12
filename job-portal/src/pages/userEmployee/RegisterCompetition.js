import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const RegisterCompetition = () => {
    const { competitionId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [competition, setCompetition] = useState(null)
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(false)
    const [alreadyRegistered, setAlreadyRegistered] = useState(false)

    useEffect(() => {
        fetchCompetition()
    }, [competitionId])

    const fetchCompetition = async () => {
        try {
            const response = await api.get(`/competitions/${competitionId}`)
            if (response.data.success) {
                setCompetition(response.data.data)
                // Check if user is already registered
                if (response.data.data.applicants?.includes(user?._id)) {
                    setAlreadyRegistered(true)
                }
            }
        } catch (error) {
            toast.error("Failed to fetch competition details")
            navigate('/employee/competitions')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        setRegistering(true)
        try {
            const response = await api.post(`/competitions/register/${competitionId}`)
            if (response.data.success) {
                toast.success(response.data.message || "Successfully registered!")
                setAlreadyRegistered(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed")
        } finally {
            setRegistering(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-64 bg-slate-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!competition) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-slate-800">Competition not found</h1>
                    <Link to="/employee/competitions" className="text-blue-600 hover:underline mt-4 block">
                        Back to Competitions
                    </Link>
                </div>
            </div>
        )
    }

    // Only applicants can register
    if (user?.role !== "applicant") {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                        <div className="text-6xl mb-4">🚫</div>
                        <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
                        <p className="text-red-600">Only applicants can register for competitions.</p>
                        <Link
                            to="/employee/competitions"
                            className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Back to Competitions
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-2xl mx-auto py-12 px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Competition Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${competition.status === 'active'
                                        ? 'bg-green-400/20 text-green-100'
                                        : 'bg-red-400/20 text-red-100'
                                    }`}>
                                    {competition.status === 'active' ? '● Active' : '● Closed'}
                                </span>
                                <h1 className="text-2xl font-bold">{competition.title}</h1>
                            </div>
                            <div className="text-right">
                                <div className="text-sm opacity-80">Prize</div>
                                <div className="text-2xl font-bold">₹{competition.prize || "TBA"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm text-slate-500">Date</div>
                                <div className="font-semibold text-slate-900">
                                    {new Date(competition.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm text-slate-500">Organizer</div>
                                <div className="font-semibold text-slate-900">
                                    {competition.organizer?.fullname || "Unknown"}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="text-sm text-slate-500 mb-1">Registered Participants</div>
                            <div className="font-semibold text-slate-900 text-2xl">
                                {competition.applicants?.length || 0} <span className="text-sm font-normal text-slate-500">participants</span>
                            </div>
                        </div>

                        {/* Registration Status / Button */}
                        {alreadyRegistered ? (
                            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <h3 className="text-lg font-bold text-green-800">You're Registered!</h3>
                                <p className="text-green-600 text-sm mt-1">
                                    You have successfully registered for this competition.
                                </p>
                                <Link
                                    to="/employee/competitions"
                                    className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Back to Competitions
                                </Link>
                            </div>
                        ) : competition.status === 'active' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <h3 className="font-semibold text-blue-800 mb-1">📋 Registration Info</h3>
                                    <p className="text-blue-600 text-sm">
                                        By registering, you confirm your participation in this competition.
                                        Make sure you're available on the competition date.
                                    </p>
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {registering ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registering...
                                        </span>
                                    ) : (
                                        "🎯 Register for Competition"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                                <div className="text-4xl mb-2">🔒</div>
                                <h3 className="text-lg font-bold text-red-800">Registration Closed</h3>
                                <p className="text-red-600 text-sm mt-1">
                                    This competition is no longer accepting registrations.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterCompetition