// components/LoginModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      // Save token in localStorage
      localStorage.setItem("token", res.data.token);

      // Close modal
      onClose();

      // Redirect to UserProfile page
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err?.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="title">Login</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          className="home-btn"
          onClick={onClose}
          style={{ marginTop: "12px", background: "#6c757d" }}
        >
          Go to Home
        </button>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          backdrop-filter: blur(4px);
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          width: 360px;
          max-width: 90%;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 22px;
          border: none;
          background: none;
          cursor: pointer;
        }
        .title {
          margin-bottom: 16px;
          font-size: 20px;
          color: #062244;
          text-align: center;
        }
        .form { display: flex; flex-direction: column; gap: 12px; }
        label { font-size: 14px; color: #333; display: flex; flex-direction: column; }
        input { padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px; }
        .btn {
          background: #0272d0;
          color: #fff;
          padding: 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .error { background: #fff5f5; color: #9b2c2c; padding: 8px; border-radius: 6px; font-size: 13px; text-align: center; }
        .home-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
