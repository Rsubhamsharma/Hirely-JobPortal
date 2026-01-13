import React, { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Signup({ onClose }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Join Us</h2>
              <p className="text-slate-500 text-sm mt-1">To get started, please select your role</p>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                className="flex-1 p-6 bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all group text-left"
                onClick={() => handleRoleSelect("applicant")}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">👨‍💻</div>
                <div className="font-bold text-slate-800 group-hover:text-blue-700">Applicant</div>
                <div className="text-xs text-slate-500 mt-1">I want to find a job</div>
              </button>

              <button
                className="flex-1 p-6 bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all group text-left"
                onClick={() => handleRoleSelect("recruiter")}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🏢</div>
                <div className="font-bold text-slate-800 group-hover:text-blue-700">Recruiter</div>
                <div className="text-xs text-slate-500 mt-1">I want to hire talent</div>
              </button>
            </div>

            <button
              className="mt-2 p-3 text-slate-500 text-sm hover:text-slate-800 transition-colors font-medium border border-transparent hover:bg-slate-50 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
              <p className="text-slate-500 text-sm mt-1">Registering as <span className="font-medium text-blue-600 capitalize">{role}</span></p>
            </div>

            <div className="space-y-3">
              <input
                name="fullname"
                type="text"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white"
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white"
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white"
              />
            </div>

            <button
              className="w-full p-3.5 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="text-center text-sm text-slate-600 mt-2">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-medium hover:underline"
              >
                Login here
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 p-3 text-slate-500 text-sm hover:text-slate-800 transition-colors font-medium border border-transparent hover:bg-slate-50 rounded-lg"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="flex-1 p-3 text-slate-500 text-sm hover:text-slate-800 transition-colors font-medium border border-transparent hover:bg-slate-50 rounded-lg"
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
