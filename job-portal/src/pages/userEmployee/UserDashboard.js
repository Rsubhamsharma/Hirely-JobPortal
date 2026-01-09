import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

function UserDashboard() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    skills: "",
    education: "",
    experience: "",
    resume: null,
    profilePic: null,
  });

  const [profileProgress, setProfileProgress] = useState(0);

  useEffect(() => {
    api
      .get("/profile/me")
      .then((res) => {
        if (res.data.success) {
          setFormData(res.data.data || {});
          setProfileProgress(res.data.data.profileProgress || 0);
        }
      })
      .catch((err) => {
        toast.error("Error fetching profile:", err);
        // Ensure that failure to fetch profile (e.g. not logged in) doesn't span generic errors too intrusively if it's expected
      });
  }, []);

  const handleChange = (e) => {

    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving profile...");
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      const res = await api.put("/profile/me", data);
      toast.success(res.data.message || "Profile updated successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.message || "Error updating profile.", { id: loadingToast });
    }
  };

  const InputGroup = ({ label, name, type = "text", placeholder, value, options }) => (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {type === "select" ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={handleChange}
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
          value={value}
          onChange={handleChange}
          className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="relative group">
            {formData.profileimage ? (
              <img
                src={typeof formData.profileimage === "string" ? formData.profileimage : URL.createObjectURL(formData.profileimage)}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-4 border-white shadow-lg">
                {formData.fullName ? formData.fullName.charAt(0) : "U"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <input type="file" name="profileimage" onChange={handleChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-2">
              {formData.fullName || "Your Name"}
              {profileProgress === 100 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200">
                  VERIFIED
                </span>
              )}
            </h1>
            <p className="text-slate-500 mb-4">{formData.email}</p>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" name="fullName" value={formData.fullName} />
              <InputGroup label="Email Address" name="email" value={formData.email} />
              <InputGroup label="Phone Number" name="phone" value={formData.phone} />
              <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} />
              <InputGroup label="Gender" name="gender" type="select" options={["Select Gender", "Male", "Female", "Other"]} value={formData.gender} />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Street Address" name="address" value={formData.address} />
              <InputGroup label="City" name="city" value={formData.city} />
              <InputGroup label="State / Province" name="state" value={formData.state} />
              <InputGroup label="Postal Code" name="pincode" value={formData.pincode} />
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Professional Profile</h3>
            <div className="grid grid-cols-1 gap-6">
              <InputGroup label="Skills (Comma separated)" name="skills" value={formData.skills} placeholder="e.g. React, Node.js, Design" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Highest Education" name="education" value={formData.education} />
                <InputGroup label="Experience (Years)" name="experience" value={formData.experience} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Documents</h3>
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center cursor-pointer group">
              <input type="file" name="resume" onChange={handleChange} className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="cursor-pointer block w-full h-full">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                <div className="text-slate-900 font-medium">Upload Resume</div>
                <div className="text-slate-500 text-sm mt-1">PDF, DOCX up to 5MB</div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserDashboard;
