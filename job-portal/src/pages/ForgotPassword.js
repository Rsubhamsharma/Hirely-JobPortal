import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP + password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/users/forgot-password", { email });

            if (res.data.success) {
                toast.success("OTP sent to your email!");
                setStep(2);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/users/reset-password", {
                email,
                otp,
                newPassword
            });

            if (res.data.success) {
                toast.success("Password reset successfully!");
                navigate("/login");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const res = await api.post("/users/forgot-password", { email });
            if (res.data.success) {
                toast.success("OTP resent to your email!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        1
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        2
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {step === 1 ? "Forgot Password?" : "Reset Password"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1
                            ? "Enter your email to receive an OTP"
                            : "Enter the OTP sent to your email"}
                    </p>
                </div>

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full p-3 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full p-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all  shadow-md hover:shadow-sm-hover disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <Link
                            to="/login"
                            className="block text-center text-sm text-blue-600 hover:underline"
                        >
                            Back to Login
                        </Link>
                    </form>
                )}

                {/* Step 2: OTP + Password Form */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full p-3 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-not-allowed"
                                value={email}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                OTP Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                className="w-full p-3 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all "
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-xs text-blue-600 hover:underline mt-1"
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-3 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all "
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-3 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full p-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all  shadow-md hover:shadow-sm-hover disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full p-3 text-slate-600 hover:text-slate-800 text-sm transition-colors"
                        >
                            ← Back to Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
