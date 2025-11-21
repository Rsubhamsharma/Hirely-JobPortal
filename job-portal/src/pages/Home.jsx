// pages/Home.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/home.css";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginEmail,
        password: loginPass,
      });

      // Save token in localStorage
      localStorage.setItem("token", data.token);

      // Close login popup
      setShowLogin(false);

      // Navigate to profile page
      navigate("/profile");
    } catch (err) {
      setLoginErr(err?.response?.data?.msg || "Invalid login details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN CONTENT */}
      <div className={`home-content ${showLogin ? "blurred" : ""}`}>
        <h1 className="title">Welcome to JobPortal</h1>
        <p className="sub">Find your dream job today 🚀</p>

        <div className="btns">
          <button className="btn" onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button className="btn" onClick={() => navigate("/signup")}>
            Signup
          </button>
        </div>
      </div>

      {/* BACKDROP */}
      {showLogin && <div className="backdrop" onClick={() => setShowLogin(false)} />}

      {/* LOGIN POPUP */}
      {showLogin && (
        <div className="popup">
          <h2>Login</h2>
          {loginErr && <p className="error">{loginErr}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
            />
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      )}

      {/* INLINE STYLES */}
      <style>{`
        .home-content { text-align: center; padding: 60px 20px; transition: filter 0.3s; }
        .blurred { filter: blur(4px); }
        .title { font-size: 36px; margin-bottom: 16px; color: #062244; }
        .sub { font-size: 18px; margin-bottom: 32px; }
        .btns { display: flex; justify-content: center; gap: 16px; }
        .btn { padding: 12px 24px; background: #0272d0; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; }
        .popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 24px; border-radius: 12px; width: 360px; max-width: 90%; z-index: 1001; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .popup h2 { margin-bottom: 16px; color: #062244; text-align: center; }
        .error { color: #9b2c2c; background: #fff5f5; padding: 8px; border-radius: 6px; margin-bottom: 12px; text-align: center; }
        form { display: flex; flex-direction: column; gap: 12px; }
        input { padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px; }
        .submit-btn { background: #0272d0; color: #fff; padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </>
  );
}
