import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiSearch,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";

const DashboardHeader = ({ pageTitle }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsDropdownOpen(false);
    navigate("/login");
  };


  return (
    <div className="bg-gray-200 flex justify-center p-4">
    <header className="z-10 mt-5 flex items-center justify-between px-6 py-3 w-[95%] max-w-7xl bg-white shadow-lg text-gray-800 rounded-full">

        {/* Left Side: Logo */}
        <h1 className="text-xl font-bold">POSS</h1>

        {/* Center: Navigation Links */}
        <nav className="flex-1 flex justify-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Home
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-800">
           Login
          </Link>
          <Link to="/SignUp" className="text-gray-600 hover:text-gray-800">
           SignUp
          </Link>
          <Link to="/logout" className="text-gray-600 hover:text-gray-800">
            LogOut
          </Link>
           <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
             Dashboard
          </Link>
        </nav>

      </header>
    </div>
  );
};

export default DashboardHeader;