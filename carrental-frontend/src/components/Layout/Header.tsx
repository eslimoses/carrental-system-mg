import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <img 
              src="https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg" 
              alt="MotoGlide Logo" 
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">MotoGlide</span>
              <span className="text-xs text-yellow-600 font-medium">Premium Car Rentals</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-yellow-600 font-medium transition duration-200">Home</Link>
            <Link to="/cars" className="text-gray-700 hover:text-yellow-600 font-medium transition duration-200">Cars</Link>
            <Link to="/subscription" className="text-gray-700 hover:text-yellow-600 font-medium transition duration-200">Subscription</Link>
            <Link to="/offers" className="text-gray-700 hover:text-yellow-600 font-medium transition duration-200">Offers</Link>
          </nav>

          {/* Right Side - Auth & Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-yellow-600 transition">
                  <FiUser size={20} />
                  <span>Dashboard</span>
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-yellow-600 font-medium transition duration-200">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-yellow-600/20 hover:shadow-yellow-600/40 transform hover:-translate-y-0.5 transition duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-800"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 bg-white border-t border-gray-200">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Cars
            </Link>
            <Link
              to="/subscription"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Subscription
            </Link>
            <Link
              to="/offers"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Offers
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="px-4 py-4 space-y-3 border-t border-gray-100 mt-2">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-3 bg-yellow-600 text-white font-bold rounded-lg shadow-lg shadow-yellow-600/20 active:bg-yellow-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;