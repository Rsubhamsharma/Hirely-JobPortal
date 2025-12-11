import React, { useState } from "react";
import axios from "axios";

function Signup({ onClose }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Select Role
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  // Step 2: Send OTP to Email (Backend will add OTP for registration)
  const handleSendOtp = async () => {
    if (!fullname || !email) return alert("Enter full name and email");

    try {
      // Backend will have /register-otp or similar endpoint for OTP
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/send-signup-otp",
        { fullname, email, role }
      );

      alert(res.data.message || "OTP sent successfully!");
      setStep(3); // Go to OTP verification step
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Step 3: Verify OTP + Complete Signup
  const handleSignup = async () => {
    if (!enteredOtp) return alert("Enter OTP");
    if (!password || !confirmPassword) return alert("Enter password");
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/signup",
        {
          fullname,
          email,
          role,
          password,
          otp: enteredOtp,
        }
      );

      alert(res.data.message || "Signup successful!");
      onClose(); // Close modal
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <>
            <h2 style={styles.heading}>Select Your Role</h2>
            <div style={styles.roleContainer}>
              <button style={styles.roleBtn} onClick={() => handleRoleSelect("applicant")}>Applicant</button>
              <button style={styles.roleBtn} onClick={() => handleRoleSelect("recruiter")}>Recruiter</button>
            </div>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && (
          <>
            <h2 style={styles.heading}>Enter Your Details</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button style={styles.signupBtn} onClick={handleSendOtp}>Send OTP</button>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}

        {/* Step 3: Verify OTP + Set Password */}
        {step === 3 && (
          <>
            <h2 style={styles.heading}>Verify OTP & Set Password</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
            <button style={styles.signupBtn} onClick={handleSignup}>Create Account</button>
            <button style={styles.closeBtn} onClick={onClose}>Cancel</button>
          </>
        )}

      </div>
    </div>
  );
}

// Styles
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    width: "420px",
    background: "#fff",
    padding: "28px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  heading: { textAlign: "center", fontSize: "22px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  roleContainer: { display: "flex", gap: "12px", marginTop: "15px" },
  roleBtn: {
    flex: 1,
    padding: "12px",
    background: "#1d3557",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  signupBtn: {
    width: "100%",
    padding: "12px",
    background: "#1d3557",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  closeBtn: {
    padding: "10px",
    background: "transparent",
    border: "1px solid #1d3557",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Signup;
