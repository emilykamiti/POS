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
    if (location.pathname === "/dashboard/search") return "Search Results";
    return "Dashboard"; // Default for /dashboard and nested routes
  };

  // Check if the current route is a dashboard route (to show sidebar)
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <div className="App">
      {/* Render DashboardHeader on every page */}
      <DashboardHeader pageTitle={getPageTitle()} />

      {/* Adjust layout based on whether sidebar is present */}
      <div className={isDashboardRoute ? "flex" : ""}>
        {/* Sidebar only for dashboard routes */}
        {isDashboardRoute && (
          <div className="w-64 h-screen bg-gray-100 fixed">
            <div className="p-4">
              <h2 className="text-xl font-bold">Sidebar</h2>
              <ul>
                <li className="mt-2">
                  <a href="/dashboard" className="text-blue-600">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={isDashboardRoute ? "ml-64 w-full" : "w-full"}>
          <div className="p-6">
            <Routes>
              {/* Redirect root to /dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard routes */}
              <Route
                path="/dashboard/*"
                element={
                  <>
                    <PageHeader
                      title="Welcome"
                      subtitle="Manage your dashboard"
                    />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/search" element={<SearchResults />} />
                    </Routes>
                  </>
                }
              />

              {/* Login route */}
              <Route path="/login" element={<Login />} />
              {/*signup */}
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </div>
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