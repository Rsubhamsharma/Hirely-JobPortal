import React from "react";

const Footer = () => {
  const footerStyle = {
    backgroundColor: "#1e90ff",
    color: "white",
    textAlign: "center",
    padding: "15px 0",
    fontFamily: "Arial, sans-serif",
    position: "relative", // relative so it doesn't overlap
    bottom: 0,
    width: "100%",
    marginTop: "50px",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    margin: "0 10px",
  };

  return (
    <footer style={footerStyle}>
      <p>© 2025 JobPortal. All rights reserved.</p>
      <div>
        <a href="#privacy" style={linkStyle}>Privacy Policy</a> | 
        <a href="#terms" style={linkStyle}>Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;
