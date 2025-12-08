import React, { useState } from "react";

function Signup({ onClose }) {
  const [step, setStep] = useState(1); // Step 1: Role, 2: Email+Name, 3: OTP+Password
  const [role, setRole] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Role select
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  // Step 2: Send OTP to email
  const handleSendOtp = async () => {
    if (!email || !fullname) return alert("Enter full name and valid email");

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtp(data.otp); // For demo/testing only, real app shouldn't return OTP
        alert("OTP sent to your email");
        setStep(3);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  // Step 3: Verify OTP and signup
  const handleSignup = async () => {
    if (enteredOtp !== otp) return alert("Incorrect OTP");
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          email,
          password,
          role,
          otp: enteredOtp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful!");
        onClose();
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {step === 1 && (
          <>
            <h2 style={styles.heading}>Select Your Role</h2>
            <div style={styles.roleContainer}>
              <button style={styles.roleBtn} onClick={() => handleRoleSelect("applicant")}>
                Applicant
              </button>
              <button style={styles.roleBtn} onClick={() => handleRoleSelect("recruiter")}>
                Recruiter
              </button>
            </div>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.heading}>Enter Your Details</h2>
            <input
              type="text"
              placeholder="Full Name"
              style={styles.input}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.signupBtn} onClick={handleSendOtp}>Send OTP</button>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.heading}>Verify OTP & Set Password</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              style={styles.input}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button style={styles.signupBtn} onClick={handleSignup}>Signup</button>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
    overflowY: "auto",
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
  heading: { margin: 0, textAlign: "center", fontSize: "22px" },
  input: { width: "100%", padding: "12px", fontSize: "15px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" },
  roleContainer: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" },
  roleBtn: { padding: "12px", flex: 1, fontSize: "16px", borderRadius: "8px", border: "1px solid #1d3557", cursor: "pointer", backgroundColor: "#1d3557", color: "#fff" },
  signupBtn: { width: "100%", padding: "12px", background: "#1d3557", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "6px" },
  closeBtn: { width: "100%", padding: "10px", background: "transparent", color: "#1d3557", border: "1px solid #1d3557", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginTop: "6px" },
};

export default Signup;
