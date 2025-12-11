import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 
import Login from "./Login";
import Signup from "./Signup";
import "../styles/Home.css";

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Job Portal</h1>
          <p>Your gateway to dream jobs and top talent.</p>
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
            <p>Find your dream job in a few clicks with filters and recommendations.</p>
          </div>
          <div className="feature-card">
            <h3>Quick Job Posting</h3>
            <p>Recruiters can post jobs and reach candidates instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Platform</h3>
            <p>All your data and applications are stored safely and privately.</p>
          </div>
          <div className="feature-card">
            <h3>Personalized Dashboard</h3>
            <p>Track applications, saved jobs, and recommended opportunities easily.</p>
          </div>
        </div>
      </section>

      {/* Popular Jobs Section */}
      <section className="jobs-section">
        <h2>Popular Jobs</h2>
        <div className="jobs-grid">
          <div className="job-card">Frontend Developer</div>
          <div className="job-card">Backend Developer</div>
          <div className="job-card">UI/UX Designer</div>
          <div className="job-card">Data Analyst</div>
        </div>
      </section>

     {/* Companies Section */}
<section className="companies-section">
  <h2>Top Companies</h2>
  <div className="companies-grid">
    <div className="company-logo">
      Google
      <p className="company-success">500+ people placed</p>
    </div>
    <div className="company-logo">
      Microsoft
      <p className="company-success">350+ people placed</p>
    </div>
    <div className="company-logo">
      Amazon
      <p className="company-success">420+ people placed</p>
    </div>
    <div className="company-logo">
      Tesla
      <p className="company-success">300+ people placed</p>
    </div>
  </div>
</section>


      {/* About Section */}
      <section className="about-section">
        <h2>About Job Portal</h2>
        <p>
          Job Portal is your one-stop platform for finding the perfect job or hiring top talent efficiently. 
          We provide a secure, fast, and user-friendly experience for both job seekers and recruiters.
        </p>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
    </div>
  );
}

export default Home;
