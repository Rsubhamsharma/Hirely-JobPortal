import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/userEmployee/UserDashboard";
import Internships from "./pages/userEmployee/Internships";
import Jobs from "./pages/userEmployee/Jobs";
import JobDetail from "./pages/userEmployee/JobDetail";
import JobApplications from "./pages/userEmployee/JobApplications";
import MyApplications from "./pages/userEmployee/MyApplications";
import Competitions from "./pages/userEmployee/Competitions";
import CompetitionDetail from "./pages/userEmployee/CompetitionDetail";
import RegisterCompetition from "./pages/userEmployee/RegisterCompetition";
import Resume from "./pages/userEmployee/Resume";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";

function AppWrapper() {
  const location = useLocation();

  // Pages where Navbar should not appear (the component has its own navbar)
  const hideNavbarPrefixes = [
    "/login",
    "/signup",
    "/employee/"
  ];

  const hideNavbar = hideNavbarPrefixes.some(prefix => location.pathname.startsWith(prefix));

  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'font-sans' }} />
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/employee/profile" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/internships" element={
          <ProtectedRoute>
            <Internships />
          </ProtectedRoute>
        } />
        <Route path="/employee/jobs" element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } />
        <Route path="/employee/jobs/:jobId" element={
          <ProtectedRoute>
            <JobDetail />
          </ProtectedRoute>
        } />
        <Route path="/employee/jobs/:jobId/applications" element={
          <ProtectedRoute>
            <JobApplications />
          </ProtectedRoute>
        } />
        <Route path="/employee/my-applications" element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        } />
        <Route path="/employee/competitions" element={
          <ProtectedRoute>
            <Competitions />
          </ProtectedRoute>
        } />
        <Route path="/employee/competitions/:competitionId" element={
          <ProtectedRoute>
            <CompetitionDetail />
          </ProtectedRoute>
        } />
        <Route path="/employee/resume" element={
          <ProtectedRoute>
            <Resume />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path="/employee/competitions/register/:competitionId" element={
          <ProtectedRoute>
            <RegisterCompetition />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </AuthProvider>
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
