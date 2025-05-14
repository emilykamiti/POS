import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by checking token in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader pageTitle="POS System - Home" />
      <main className="pt-20 p-4 ml-[250px]">
        {isAuthenticated ? (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to the POS System
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your sales, inventory, and customers efficiently with our
              Point of Sale system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sales Overview
                </h3>
                <p className="text-gray-600">
                  View real-time sales data and analytics.
                </p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => navigate("/dashboard/sales")}
                >
                  View Sales
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Inventory Management
                </h3>
                <p className="text-gray-600">
                  Track and manage your inventory with ease.
                </p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => navigate("/dashboard/inventory")}
                >
                  Manage Inventory
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Customer Insights
                </h3>
                <p className="text-gray-600">
                  Understand your customers and their preferences.
                </p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => navigate("/dashboard/customers")}
                >
                  View Customers
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to access the POS system and manage your business.
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
              onClick={handleLogin}
            >
              Log In
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;