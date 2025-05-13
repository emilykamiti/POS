import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import profileImage from '../assets/default.jpg';
import { FaSearch, FaMoon, FaSun, FaCog, FaChevronDown } from 'react-icons/fa';

const Navbar = ({ user }) => {
  const { mode, toggleMode } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white top-2 dark:bg-gray-200 shadow">
      <div className='flex items-center justify-between px-4 py-2'>
        {/* Search bar */}
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded px-3 py-1'>
            <input
              type='text'
              placeholder='Search...'
              className='bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-40 md:w-64'
            />
            <FaSearch className='text-gray-500 dark:text-gray-300' />
          </div>
        </div>

        {/* Right side actions */}
        <div className='flex items-center gap-6'>
          <button onClick={toggleMode} className='text-gray-700 dark:text-gray-200'>
            {mode === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <button className='text-gray-700 dark:text-gray-200'>
            <FaCog size={20} />
          </button>
          <div className='relative'>

            {dropdownOpen && (
              <div className='absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg z-10'>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;