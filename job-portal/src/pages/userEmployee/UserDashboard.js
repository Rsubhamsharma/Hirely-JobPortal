import React, { useEffect, useState } from "react";
import axios from "axios";

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

  // FETCH USER DATA FROM BACKEND
  useEffect(() => {
    axios
      .get("/api/user/profile") // Replace with your API endpoint
      .then((res) => {
        if (res.data) {
          setFormData(res.data);
          setProfileProgress(res.data.profileProgress || 0);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  // HANDLE FORM CHANGE
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // HANDLE FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      const res = await axios.post("/api/user/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error updating profile.");
    }
  };

  return (
    <div style={styles.container}>
      {/* PROFILE HEADER */}
      <div style={styles.header}>
        <div style={styles.profilePicWrapper}>
          {formData.profilePic ? (
            <img
              src={
                typeof formData.profilePic === "string"
                  ? formData.profilePic
                  : URL.createObjectURL(formData.profilePic)
              }
              alt="Profile"
              style={styles.profilePic}
            />
          ) : (
            <div style={styles.profilePicPlaceholder}>Add Photo</div>
          )}
        </div>
        <div>
          <h2 style={styles.name}>
            {formData.fullName || "Your Name"}{" "}
            {profileProgress === 100 && <span style={styles.badge}>✔ Verified</span>}
          </h2>
          <p style={styles.progressText}>Profile Completion: {profileProgress}%</p>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${profileProgress}%` }}></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* PERSONAL DETAILS */}
        <div style={styles.card}>
          <h3>Personal Details</h3>
          <div style={styles.inputGroup}>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} style={styles.input} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} />
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={styles.input} />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={styles.input} />
            <select name="gender" value={formData.gender} onChange={handleChange} style={styles.input}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* ADDRESS */}
        <div style={styles.card}>
          <h3>Address Details</h3>
          <div style={styles.inputGroup}>
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} style={styles.input} />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} style={styles.input} />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} style={styles.input} />
            <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        {/* PROFESSIONAL */}
        <div style={styles.card}>
          <h3>Professional Details</h3>
          <div style={styles.inputGroup}>
            <input type="text" name="skills" placeholder="Skills" value={formData.skills} onChange={handleChange} style={styles.input} />
            <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} style={styles.input} />
            <input type="text" name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        {/* DOCUMENTS */}
        <div style={styles.card}>
          <h3>Upload Documents</h3>
          <div style={styles.inputGroup}>
            <label style={styles.uploadLabel}>
              Upload Resume
              <input type="file" name="resume" onChange={handleChange} style={styles.fileInput} />
            </label>
            <label style={styles.uploadLabel}>
              Upload Profile Picture
              <input type="file" name="profilePic" onChange={handleChange} style={styles.fileInput} />
            </label>
          </div>
        </div>

        <button type="submit" style={styles.submitBtn}>Save Profile</button>
      </form>
    </div>
  );
}

// STYLES (same as before)
const styles = {
  container: { maxWidth: "900px", margin: "40px auto", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", alignItems: "center", marginBottom: "30px" },
  profilePicWrapper: { marginRight: "25px" },
  profilePic: { width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" },
  profilePicPlaceholder: { width: "100px", height: "100px", borderRadius: "50%", background: "#d1d5db", display: "flex", justifyContent: "center", alignItems: "center", color: "#555", fontSize: "14px" },
  name: { margin: 0, fontSize: "24px" },
  badge: { background: "#2563eb", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "14px", marginLeft: "10px" },
  progressText: { margin: "5px 0" },
  progressBar: { width: "100%", height: "10px", background: "#e5e7eb", borderRadius: "10px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#10b981", transition: "0.4s" },
  card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 3px 15px rgba(0,0,0,0.08)", marginBottom: "20px" },
  inputGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "10px" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", marginTop: "10px" },
  uploadLabel: { display: "flex", flexDirection: "column", padding: "10px", background: "#f3f4f6", borderRadius: "6px", cursor: "pointer", marginTop: "10px" },
  fileInput: { display: "none" },
  submitBtn: { padding: "12px 25px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "15px" },
};

export default UserDashboard;
