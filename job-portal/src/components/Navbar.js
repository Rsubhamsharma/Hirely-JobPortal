import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Job Portal</h2>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/jobs">Jobs</a>
        <a href="/companies">Companies</a>
        <a href="/about">About</a>
        <a href="/profile">Profile</a>
      </div>
    </nav>
  );
}

export default Navbar;
