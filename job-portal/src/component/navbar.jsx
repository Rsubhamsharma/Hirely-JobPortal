import React from "react";

const Navbar = () => {
  const navbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#1e90ff",
    color: "white",
    fontFamily: "Arial, sans-serif",
  };

  const navLinksStyle = {
    display: "flex",
    gap: "15px",
    listStyle: "none",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  };

  return (
    <nav style={navbarStyle}>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>JobPortal</div>
      <ul style={navLinksStyle}>
        <li><a href="#home" style={linkStyle}>Home</a></li>
        <li><a href="#jobs" style={linkStyle}>Jobs</a></li>
        <li><a href="#about" style={linkStyle}>About</a></li>
        <li><a href="#contact" style={linkStyle}>Contact</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
