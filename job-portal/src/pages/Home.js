import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 
import Login from "./Login";
import Signup from "./Signup";
import "../styles/Home.css";

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // STATIC DEFAULT CONTENT (USED BECAUSE NO BACKEND API EXISTS)
  const [homeContent] = useState({
    title: "Welcome to Job Portal",
    subtitle: "Your gateway to dream jobs and top talent.",
  });

  const [popularJobs] = useState([
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Data Analyst",
  ]);

  const [companies] = useState([
    { name: "Google", placed: 500 },
    { name: "Microsoft", placed: 350 },
    { name: "Amazon", placed: 420 },
    { name: "Tesla", placed: 300 },
  ]);

  // API DISABLED (your backend team has not created any of these APIs)
  useEffect(() => {
    console.log("Home API disabled — using static UI content.");
  }, []);

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>{homeContent.title}</h1>
          <p>{homeContent.subtitle}</p>
          <div className="hero-buttons">
            <button className="home-btn signup-btn" onClick={() => setShowSignup(true)}>
              Signup
            </button>
            <button className="home-btn login-btn" onClick={() => setShowLogin(true)}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Job Portal?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Job Search</h3>
            <p>Find your dream job with filters and recommendations.</p>
          </div>
          <div className="feature-card">
            <h3>Quick Job Posting</h3>
            <p>Recruiters can post jobs and reach candidates instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Platform</h3>
            <p>We keep your data safe and private.</p>
          </div>
          <div className="feature-card">
            <h3>Personalized Dashboard</h3>
            <p>Track applications and recommended opportunities.</p>
          </div>
        </div>
      </section>

      {/* Popular Jobs Section */}
      <section className="jobs-section">
        <h2>Popular Jobs</h2>
        <div className="jobs-grid">
          {popularJobs.map((job, index) => (
            <div key={index} className="job-card">{job}</div>
          ))}
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies-section">
        <h2>Top Companies</h2>
        <div className="companies-grid">
          {companies.map((c, index) => (
            <div key={index} className="company-logo">
              {c.name}
              <p className="company-success">{c.placed}+ people placed</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About Job Portal</h2>
        <p>
          Job Portal helps job seekers and companies connect quickly, securely, and efficiently.
        </p>
      </section>

      <Footer />

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
    </div>
  );
}

export default Home;
