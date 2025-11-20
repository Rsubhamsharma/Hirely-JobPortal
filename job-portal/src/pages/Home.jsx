import React from "react";

const Home = () => {
  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    color: "#333",
    textAlign: "center",
    padding: "0 20px",
  };

  const heroStyle = {
    background: "linear-gradient(to right, #1e90ff, #00bfff)",
    color: "white",
    padding: "100px 20px",
    borderRadius: "10px",
    marginTop: "20px",
  };

  const buttonStyle = {
    backgroundColor: "white",
    color: "#1e90ff",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
    transition: "0.3s",
  };

  const sectionStyle = {
    marginTop: "50px",
  };

  const cardStyle = {
    display: "inline-block",
    width: "250px",
    margin: "15px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "0.3s",
    backgroundColor: "#fff",
  };

  const services = [
    { title: "Find Jobs", desc: "Search and apply to thousands of jobs in top companies." },
    { title: "Post Jobs", desc: "Companies can post their openings and hire the best talent." },
    { title: "Career Advice", desc: "Get tips and guidance to grow your career successfully." },
  ];

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Welcome to JobPortal</h1>
        <p style={{ fontSize: "1.2rem" }}>Connecting talent with opportunity. Your dream job is just a click away!</p>
        <button
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
        >
          Get Started
        </button>
      </div>

      {/* Services Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>What We Offer</h2>
        {services.map((service, index) => (
          <div
            key={index}
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#1e90ff" }}>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={{ ...sectionStyle, marginBottom: "100px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Join Us Today!</h2>
        <p style={{ fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
          Sign up now and take the first step towards your dream career. Explore jobs, post openings, and grow professionally with JobPortal.
        </p>
        <button
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Home;
