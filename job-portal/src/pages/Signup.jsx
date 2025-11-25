import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    role: "jobseeker",
    skills: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setResumeFile(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username || !form.email || !form.password) {
      return setError("Please fill required fields.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      if (resumeFile) data.append("resume", resumeFile);

      const res = await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.msg);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
  console.error("Full Signup error:", err);
  setError(err?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="backdrop" />
      <div className="card">
        <h2 className="title">Create an Account</h2>
        <p className="subtitle">Join as a Job Seeker or Recruiter</p>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="two-col">
            <label className="field">
              <span>Full Name</span>
              <input name="username" value={form.username} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
            </label>
          </div>

          <label className="field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <div className="two-col">
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Confirm Password</span>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
            </label>
          </div>

          <div className="two-col">
            <label className="field">
              <span>City</span>
              <input name="city" value={form.city} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Role</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="jobseeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Skills (comma separated)</span>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node, SQL" />
          </label>

          <label className="field">
            <span>Resume (PDF, optional)</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
          </label>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="small">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </form>
        <button
  className="btn"
  type="button"
  onClick={() => navigate("/")}
  style={{ background: "#6c757d", marginTop: "10px" }}
>
  Go to Home
</button>

      </div>

      <style>{`
        .signup-page { position: relative; min-height: calc(100vh - 80px); display:flex; align-items:center; justify-content:center; padding:36px 18px; }
        .backdrop { position:absolute; inset:0; background: linear-gradient(120deg, rgba(3,37,65,0.9), rgba(5,82,145,0.9)); z-index:0; }
        .card { position:relative; z-index:2; width:760px; max-width:96%; background:white; border-radius:12px; padding:26px; box-shadow:0 24px 50px rgba(2,12,27,0.55); }
        .title{ margin:0; font-size:22px; color:#062244; font-weight:700; }
        .home-btn {
  padding: 10px;
  border-radius: 8px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

        .subtitle{ margin:6px 0 16px; color:#5b6b7a; font-size:14px; }
        .form{ display:flex; flex-direction:column; gap:12px; }
        .two-col{ display:flex; gap:12px; }
        .two-col .field{ flex:1; }
        .field{ display:flex; flex-direction:column; gap:6px; font-size:13px; color:#34485a; }
        .field span{ font-weight:600; font-size:13px; }
        input, select{ padding:9px 12px; border-radius:8px; border:1px solid #e3e8ee; font-size:14px; }
        input[type="file"]{ padding:6px 4px; }
        input:focus, select:focus{ box-shadow: 0 0 0 4px rgba(2,62,138,0.06); border-color:#0272d0; outline:none; }
        .btn{ padding:10px 12px; border-radius:8px; border:0; background:#0272d0; color:white; font-weight:700; cursor:pointer; font-size:15px; }
        .btn:disabled{ opacity:0.7; cursor:not-allowed; }
        .small{ margin-top:6px; font-size:13px; color:#596b7d; }
        a{ color:#0272d0; text-decoration:none; font-weight:600; }
        .error { background:#fff5f5; color:#9b2c2c; padding:8px 10px; border-radius:8px; border:1px solid #f8d7da; font-size:13px; }
        .success { background:#f0fff4; color:#166534; padding:8px 10px; border-radius:8px; border:1px solid #bbf7d0; font-size:13px; }
        @media (max-width:820px){ .two-col{ flex-direction:column } .card{ padding:18px } }
      `}</style>
    </div>
  );
}
