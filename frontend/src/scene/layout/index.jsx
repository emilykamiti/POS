import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";

const Layout = ({ userId }) => {
  const isNonMobile = window.matchMedia("(min-width: 600px)").matches;
  const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
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

  return (
    <div className="flex flex-col w-full h-screen md:flex-row">
      <Sidebar
        user={data || {}}
        isNonMobile={isNonMobile}
        drawerWidth="200px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen && isNonMobile ? "250px" : "0",
          width: isSidebarOpen && isNonMobile ? "calc(100% - 250px)" : "100%"
        }}
      >

        <div className="flex-1 p-4 md:p-10 overflow-auto">
          {isLoading ? <p>Loading...</p> : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default Layout;