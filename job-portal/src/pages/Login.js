import React, { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"

function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });

      if (res.data.success) {
        toast.success("Login successful!");

        // The backend returns: { statusCode, data: { user, accessToken, refreshToken }, message, success }
        const userData = res.data.data.user;
        const accessToken = res.data.data.accessToken;

        // Store token in localStorage for:
        // 1. WebSocket authentication
        // 2. Backup auth method for mobile browsers that may block cookies
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }

        login(userData);
        if (onClose) onClose();
        navigate("/");
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {

      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    try {
      navigate("/")


    } catch (error) {
      toast.error("Error logging out");

    }
  }

  return (
    <div className="fixed inset-0  z-[100] flex items-center justify-center bg-slate-900/70 dark:bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 pb-12 rounded-2xl shadow-2xl flex flex-col gap-5 relative overflow-hidden transition-colors">


        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please enter your details to sign in</p>
        </div>


        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all  hover:bg-white dark:hover:bg-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <NavLink
                to="/forgot-password"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Forgot Password?
              </NavLink>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all hover:bg-white dark:hover:bg-slate-600 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          className="w-full p-3.5 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all  shadow-md hover:shadow-sm-hover disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          className="w-full p-3 bg-gray-300 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-sm hover:text-slate-800 dark:hover:text-white transition-colors font-medium border border-transparent hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg"
          onClick={handleClose}
        >
          Cancel
        </button>

        <div className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">
          Don&apos;t have an account?{" "}
          <NavLink to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Register Now
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Login;
