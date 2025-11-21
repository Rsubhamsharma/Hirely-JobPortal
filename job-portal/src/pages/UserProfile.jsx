// pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserProfile() {
  const [user, setUser] = useState({});
  const [form, setForm] = useState({
    name: "",
    address: "",
    bio: "",
    skills: "",
    education: "",
    experience: "",
    linkedin: "",
    github: "",
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setUser(data);
        setForm({
          name: data.name || "",
          address: data.address || "",
          bio: data.bio || "",
          skills: data.skills || "",
          education: data.education || "",
          experience: data.experience || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch user data.");
      }
    };

    fetchUser();
  }, []);

  // Handle input change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImage(e.target.files[0]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("avatar", image);

      const res = await axios.put("http://localhost:5000/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data);
      setForm({
        name: res.data.name || "",
        address: res.data.address || "",
        bio: res.data.bio || "",
        skills: res.data.skills || "",
        education: res.data.education || "",
        experience: res.data.experience || "",
        linkedin: res.data.linkedin || "",
        github: res.data.github || "",
      });

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.msg || "Update failed");
    }
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-section">
          <label htmlFor="avatar-upload">
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : user.avatar
                  ? `http://localhost:5000/uploads/${user.avatar}`
                  : "https://via.placeholder.com/150?text=Profile"
              }
              alt="Profile"
              className="avatar"
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="header-info">
          <h1>{user.name || "Your Name"}</h1>
          <p className="bio">{user.bio || "Your bio goes here..."}</p>

          <div className="skills">
            {user.skills
              ? user.skills.split(",").map((skill, i) => (
                  <span key={i} className="skill-badge">
                    {skill.trim()}
                  </span>
                ))
              : <span className="skill-badge placeholder">Add skills</span>}
          </div>

          <div className="links">
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="profile-details">
        <h2>Profile Details</h2>
        <form className="edit-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange}></textarea>
          <input type="text" name="skills" placeholder="Skills, comma separated" value={form.skills} onChange={handleChange} />
          <input type="text" name="education" placeholder="Education" value={form.education} onChange={handleChange} />
          <input type="text" name="experience" placeholder="Experience" value={form.experience} onChange={handleChange} />
          <input type="text" name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} />
          <input type="text" name="github" placeholder="Github / Portfolio URL" value={form.github} onChange={handleChange} />
          <button type="submit">Update Profile</button>
        </form>
        {message && <p className="msg">{message}</p>}
      </div>

      {/* CSS Styles */}
      <style>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f2f5, #d9e2ec);
          padding: 40px 80px;
          font-family: 'Segoe UI', sans-serif;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 40px;
        }
        .avatar-section { flex-shrink: 0; }
        .avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 4px solid #0272d0;
          object-fit: cover;
          cursor: pointer;
        }
        .header-info h1 { margin: 0; font-size: 32px; color: #062244; }
        .bio { font-style: italic; color: #555; margin: 8px 0 12px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .skill-badge { background: #0272d0; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 14px; }
        .skill-badge.placeholder { background: #aaa; }
        .links a { margin-right: 15px; color: #0272d0; font-weight: 600; text-decoration: none; }
        .profile-details { width: 100%; }
        .profile-details h2 { font-size: 24px; color: #062244; margin-bottom: 20px; border-bottom: 2px solid #0272d0; padding-bottom: 6px; }
        .edit-form { display: flex; flex-wrap: wrap; gap: 16px; }
        .edit-form input, .edit-form textarea { flex: 1 1 45%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; }
        .edit-form textarea { resize: none; height: 60px; flex-basis: 100%; }
        .edit-form button { padding: 12px 24px; border: none; border-radius: 8px; background: #0272d0; color: #fff; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .msg { color: green; margin-top: 12px; font-weight: 500; }
        @media(max-width: 900px) {
          .profile-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .edit-form input, .edit-form textarea { flex-basis: 100%; }
        }
      `}</style>
    </div>
  );
}
