import React, { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Signup({ onClose }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };
  const handleClose = () => {
    try {
      navigate("/")


    } catch (error) {
      console.log(error)

    }
  }

  const handleSignup = async () => {
    const { fullname, email, password, confirmPassword } = formData;
    if (!fullname || !email || !password || !confirmPassword || !role) {
      return toast.error("All fields are required");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await api.post("/users/register", {
        fullname,
        email,
        role,
        password,
      });

      if (res.data.success) {
        toast.success("Signup successful! Please login.");
        if (onClose) onClose();
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 dark:bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-5 relative overflow-hidden transition-colors">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join Us</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">To get started, please select your role</p>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                className="flex-1 p-6 bg-slate-50 dark:bg-slate-700 border border-slate-200-100 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all  group text-left"
                onClick={() => handleRoleSelect("applicant")}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">👨‍💻</div>
                <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Applicant</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">I want to find a job</div>
              </button>

              <button
                className="flex-1 p-6 bg-slate-50 dark:bg-slate-700 border border-slate-200-100 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all  group text-left"
                onClick={() => handleRoleSelect("recruiter")}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🏢</div>
                <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">Recruiter</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">I want to hire talent</div>
              </button>
            </div>

            <button
              className="mt-2 p-3 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-white transition-colors font-medium border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Registering as <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">{role}</span></p>
            </div>

            <div className="space-y-3">
              <input
                name="fullname"
                type="text"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all  hover:bg-white dark:hover:bg-slate-600"
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all  hover:bg-white dark:hover:bg-slate-600"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white dark:hover:bg-slate-600 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
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
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white dark:hover:bg-slate-600 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="w-full p-3.5 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all  shadow-md hover:shadow-sm-hover disabled:opacity-70"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-300 mt-2">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Login here
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 p-3 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-white transition-colors font-medium border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="flex-1 p-3 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-white transition-colors font-medium border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Signup;
