import React, { useState } from "react";

function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert("Login successful");
        onClose();
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  // Note: inline styles ensure overlay covers viewport and is above everything
  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.card} role="dialog" aria-modal="true">
          <h2 style={styles.heading}>Login</h2>

          <input
            type="email"
            placeholder="Enter email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.loginBtn} onClick={handleLogin}>
            Login
          </button>

          <button style={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,                   // top:0; right:0; bottom:0; left:0;
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.55)", // dim background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,              // sit on top of everything
    padding: "20px",
    overflowY: "auto"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  heading: {
    margin: 0,
    textAlign: "center",
    fontSize: "22px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    background: "#1d3557",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "6px",
  },
  closeBtn: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "#1d3557",
    border: "1px solid #1d3557",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default Login;
