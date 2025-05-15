import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiShoppingCart, FiUsers,
  FiFileText, FiDollarSign, FiTrendingUp,
  FiLogOut
} from 'react-icons/fi';
import profileImage from '../assets/default.jpg';
import { AuthContext } from '../utils/AuthContext';
import api from '../state/api';

const navItems = [
  { text: 'Dashboard', icon: <FiHome /> },
  { text: 'Client Facing', icon: null },
  { text: 'Products', icon: <FiShoppingCart /> },
  { text: 'Sales', icon: <FiFileText /> },
  { text: 'Customers', icon: <FiUsers /> },
  { text: 'Management', icon: null },
  { text: 'Overview', icon: <FiTrendingUp /> },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { token, logout, user: authUser } = useContext(AuthContext);
  const [active, setActive] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when token changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        if (authUser) {
          setUserData(authUser);
          return;
        }

        // If no authUser but we have a token, fetch from API
        if (token) {
          const data = await api.getCurrentUser(token);
          setUserData(data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, authUser, logout]);


  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e) => {
    if (isResizing) {
      const newWidth = Math.max(200, Math.min(e.clientX, 350));
      setSidebarWidth(newWidth);
    }
  };

  const stopResize = () => {
    setIsResizing(false);
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-200 z-40 transition-all duration-200 ${isResizing ? 'cursor-col-resize' : ''}`}
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Navigation Items */}
        <div className="overflow-y-auto">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-white">POSS</h1>
          </div>

          {navItems.map(({ text, icon }) => {
            if (!icon) {
              return (
                <div key={text} className="ml-6 my-2 text-gray-400 text-sm font-semibold">
                  {text}
                </div>
              );
            }

            const lcText = text.toLowerCase();
            const isActive = active === lcText;

            return (
              <button
                key={text}
                onClick={() => navigate(`/${lcText}`)}
                className={`flex items-center w-full py-3 px-4 text-left transition-colors
                  ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}
                `}
              >
                <span className={`text-lg ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                  {icon}
                </span>
                <span className="ml-3">{text}</span>
                {isActive && (
                  <span className="ml-auto text-gray-400">
                    >
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-700 p-4">
          {loading ? (
            <div className="flex items-center animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-700"></div>
              <div className="ml-3 space-y-2">
                <div className="h-4 w-32 bg-gray-700 rounded"></div>
                <div className="h-3 w-40 bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <img
                  src={userData?.profileImage || profileImage}
                  alt="profile"
                  className="h-10 w-10 rounded-full object-cover border border-gray-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-bold text-white">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userData?.email || 'No email'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full py-3 px-4 mt-2 text-left text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <FiLogOut className="text-lg text-gray-400" />
                <span className="ml-3">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors"
        onMouseDown={startResize}
      />
    </div>
  );
};

export default Sidebar;