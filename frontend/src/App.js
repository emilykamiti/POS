import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import DashboardHeader from "./components/DashboardHeader";
import PageHeader from "./components/PageHeader";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import SearchResults from "./components/SearchResults";

// Wrapper component to determine page title dynamically
function AppContent() {
  const location = useLocation();

  // Determine page title based on the current route
  const getPageTitle = () => {
    if (location.pathname === "/login") return "Login";
    if (location.pathname === "/signup") return "Sign Up";
    if (location.pathname === "/dashboard/search") return "Search Results";
    return "Dashboard";
  };

  return (
    <div className="App">
      {/* Render DashboardHeader on every page */}
      <DashboardHeader pageTitle={getPageTitle()} />
      {/* Main content */}
      <div className="w-full flex justify-center">
        <div className="p-8 pt-24 max-w-6xl w-full">
          <Routes>
            {/* Redirect root to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Login route */}
            <Route path="/login" element={<Login />} />
            {/* Signup route */}
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;