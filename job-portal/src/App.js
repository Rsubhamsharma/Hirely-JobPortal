import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserHome from "./pages/userEmployee/userHome";
import UserDashboard from "./pages/userEmployee/UserDashboard"; // Profile dashboard
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Placeholder pages for future routes
import Internships from "./pages/userEmployee/Internships";
import Jobs from "./pages/userEmployee/Jobs";
import Competitions from "./pages/userEmployee/Competitions";
import Resume from "./pages/userEmployee/Resume";

function AppWrapper() {
  const location = useLocation();

  // Pages where Navbar should not appear
  const hideNavbarPages = [
    "/login",
    "/signup",
    "/employee/home",
    "/employee/internships",
    "/employee/jobs",
    "/employee/competitions",
    "/employee/resume",
    "/employee/profile",
  ];

  const hideNavbar = hideNavbarPages.includes(location.pathname);

  return (
    <>
      {/* Show Navbar only on public pages */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login & Signup */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Employee Dashboard */}
        <Route path="/employee/home" element={<UserHome />} />

        {/* Employee Profile Dashboard */}
        <Route path="/employee/profile" element={<UserDashboard />} />

        {/* Employee Other Pages */}
        <Route path="/employee/internships" element={<Internships />} />
        <Route path="/employee/jobs" element={<Jobs />} />
        <Route path="/employee/competitions" element={<Competitions />} />
        <Route path="/employee/resume" element={<Resume />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
