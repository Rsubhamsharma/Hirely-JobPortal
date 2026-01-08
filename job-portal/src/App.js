import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserHome from "./pages/userEmployee/userHome";
import UserDashboard from "./pages/userEmployee/UserDashboard";
import Internships from "./pages/userEmployee/Internships";
import Jobs from "./pages/userEmployee/Jobs";
import Competitions from "./pages/userEmployee/Competitions";
import Resume from "./pages/userEmployee/Resume";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";

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
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'font-sans' }} />
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/employee/home" element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        } />
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
        <Route path="/employee/competitions" element={
          <ProtectedRoute>
            <Competitions />
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
