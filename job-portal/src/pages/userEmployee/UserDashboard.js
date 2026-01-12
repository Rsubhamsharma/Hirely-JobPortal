import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// InputGroup component defined OUTSIDE to prevent re-creation on every render
const InputGroup = ({ label, name, type = "text", placeholder, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    {type === "select" ? (
      <div className="relative">
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
        >
          {options.map((opt) => (
            <option key={opt} value={opt === options[0] ? "" : opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">▼</div>
      </div>
    ) : (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
      />
    )}
  </div>
);

function UserDashboard() {
  const { user } = useAuth();
  const formRef = useRef(null);

  // Form state matching the backend profile schema
  const [formData, setFormData] = useState({
    phoneNumber: "",
    profilesummary: "",
    portfolio: "",
    github: "",
    linkedin: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileProgress, setProfileProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      if (res.data.success && res.data.data) {
        const profile = res.data.data;
        setFormData({
          phoneNumber: profile.phoneNumber || "",
          profilesummary: profile.profilesummary || "",
          portfolio: profile.portfolio || "",
          github: profile.github || "",
          linkedin: profile.linkedin || "",
        });
        if (profile.profileimage) {
          setProfileImagePreview(profile.profileimage);
        }
        if (profile.resume) {
          setResumeName("Resume uploaded");
        }
        // Calculate progress
        calculateProgress(profile);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching profile:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (profile) => {
    const fields = ['phoneNumber', 'profilesummary', 'portfolio', 'github', 'linkedin', 'resume', 'profileimage'];
    let filled = 0;
    fields.forEach(field => {
      if (profile[field] && profile[field] !== "") filled++;
    });
    setProfileProgress(Math.round((filled / fields.length) * 100));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setResumeName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("Saving profile...");

    try {
      const data = new FormData();

      // Add text fields
      if (formData.phoneNumber) data.append("phoneNumber", formData.phoneNumber);
      if (formData.profilesummary) data.append("profilesummary", formData.profilesummary);
      if (formData.portfolio) data.append("portfolio", formData.portfolio);
      if (formData.github) data.append("github", formData.github);
      if (formData.linkedin) data.append("linkedin", formData.linkedin);

      // Add files
      if (profileImage) data.append("profileimage", profileImage);
      if (resume) data.append("resume", resume);

      const res = await api.put("/profile/me", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(res.data.message || "Profile updated successfully!", { id: loadingToast });

      // Recalculate progress
      if (res.data.data) {
        calculateProgress(res.data.data);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.message || "Error updating profile.", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="relative group">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-4 border-white shadow-lg">
                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-2">
              {user?.fullname || "Your Name"}
              {profileProgress === 100 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200">
                  COMPLETE
                </span>
              )}
            </h1>
            <p className="text-slate-500 mb-4">{user?.email}</p>

            <div className="max-w-md">
              <div className="flex justify-between text-sm font-medium mb-1.5">
                <span className="text-slate-600">Profile Completion</span>
                <span className="text-blue-600">{profileProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${profileProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 mb-1.5">Email (from account)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Professional Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Professional Profile</h3>
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 mb-1.5">Profile Summary</label>
                <textarea
                  name="profilesummary"
                  value={formData.profilesummary}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Social & Portfolio Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup
                label="Portfolio URL"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
              <InputGroup
                label="GitHub URL"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
              <InputGroup
                label="LinkedIn URL"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Resume</h3>
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer block w-full h-full">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                <div className="text-slate-900 font-medium">
                  {resumeName || "Upload Resume"}
                </div>
                <div className="text-slate-500 text-sm mt-1">PDF, DOCX up to 5MB</div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserDashboard;
