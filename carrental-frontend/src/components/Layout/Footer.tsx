import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">MotoGlide</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted partner for hassle-free car rentals. Drive with confidence, travel with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition"><FiFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition"><FiTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition"><FiInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition"><FiLinkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-yellow-500 transition">Home</Link></li>
              <li><Link to="/cars" className="text-gray-400 hover:text-yellow-500 transition">Browse Cars</Link></li>
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-yellow-500 transition">How It Works</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-yellow-500 transition">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-400 hover:text-yellow-500 transition">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-yellow-500 transition">Contact Us</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-yellow-500 transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-yellow-500 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-yellow-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-400 text-sm">123 Car Street, Chennai, Tamil Nadu 600001, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-yellow-500 flex-shrink-0" size={18} />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-yellow-500 flex-shrink-0" size={18} />
                <span className="text-gray-400 text-sm">support@motoglide.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Logo */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src="https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg" 
                alt="MotoGlide Logo" 
                className="h-12 w-12 rounded-lg bg-white p-1"
              />
              <span className="text-yellow-500 text-2xl font-bold">MotoGlide</span>
            </div>
            <p className="text-gray-400 text-sm">Premium Car Rentals in India</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/terms" className="text-gray-400 hover:text-yellow-500 transition">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-yellow-500 transition">Privacy Policy</Link>
            <Link to="/cookies" className="text-gray-400 hover:text-yellow-500 transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
