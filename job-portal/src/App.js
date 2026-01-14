import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { useSocketEvents } from './hooks/useSocketEvents';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const UserDashboard = lazy(() => import("./pages/userEmployee/UserDashboard"));
const Internships = lazy(() => import("./pages/userEmployee/Internships"));
const Jobs = lazy(() => import("./pages/userEmployee/Jobs"));
const JobDetail = lazy(() => import("./pages/userEmployee/JobDetail"));
const JobApplications = lazy(() => import("./pages/userEmployee/JobApplications"));
const MyApplications = lazy(() => import("./pages/userEmployee/MyApplications"));
const Competitions = lazy(() => import("./pages/userEmployee/Competitions"));
const CompetitionDetail = lazy(() => import("./pages/userEmployee/CompetitionDetail"));
const RegisterCompetition = lazy(() => import("./pages/userEmployee/RegisterCompetition"));
const Messages = lazy(() => import("./pages/userEmployee/Messages"));
const Resume = lazy(() => import("./pages/userEmployee/Resume"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const SocketEventManager = () => {
  useSocketEvents();
  return null;
};

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <SocketEventManager />
            <ScrollToTop />
            <Toaster position="top-right" toastOptions={{ className: 'font-sans' }} />
            {!hideNavbar && <Navbar />}

            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

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
                <Route path="/employee/messages" element={
                  <ProtectedRoute>
                    <Messages />
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
            </Suspense>
            <Footer />
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
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
