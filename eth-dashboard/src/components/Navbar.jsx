import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Box, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import ethLogo from "../assets/eth-logo.svg"; 

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isActive = (path) => location.pathname === path 
    ? "text-brand-500 font-bold bg-blue-50 dark:bg-blue-900/20" 
    : "text-gray-500 hover:text-brand-500";

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111b36] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src={ethLogo} 
              alt="Eth Logo" 
              className="w-8 h-8" 
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Eth <span className="font-light">Dashboard</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive('/')}`}>
              <Box size={18} /> Explorer
            </Link>
            <Link to="/wallet" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive('/wallet')}`}>
              <Wallet size={18} /> Wallet
            </Link>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}