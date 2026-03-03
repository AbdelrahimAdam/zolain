import React from 'react';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react'; // or your logo icon
import Button from '../UI/Button';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-blue-100/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Zolain
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Courses
              </Link>
              <Link to="/instructors" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Instructors
              </Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-blue-100/50 dark:border-gray-700/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} Zolain for Languages, Translations & Training. All rights reserved.
          <br />
          <span className="text-xs mt-1 block">Khartoum, Sudan | info@zolain.com</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;