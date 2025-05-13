import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";

const Layout = ({ userId }) => { // Accept userId as a prop
  const isNonMobile = window.matchMedia("(min-width: 600px)").matches;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return; // Skip fetching if userId is null

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`); // Adjust the API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await response.json();
        setData(userData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  console.log("data", data);

  return (
    <div className="flex flex-col w-full h-screen md:flex-row">
      <Sidebar
        user={data || {}}
        isNonMobile={isNonMobile}
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col">
        <Navbar
          user={data || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 p-2 overflow-auto mt-16 md:mt-0">
          {isLoading ? <p>Loading...</p> : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default Layout;