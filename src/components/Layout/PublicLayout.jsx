import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Facebook, MessageCircle, Youtube, Send, Instagram } from 'lucide-react';
import Button from '../UI/Button';

const PublicLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const closeMenu = () => setIsMenuOpen(false);

  // ✅ Updated Facebook and YouTube URLs
  const facebookUrl = 'https://www.facebook.com/share/1DVCnhYvke/';
  const whatsappNumber = '249903806123';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20Zolain%2C%20I%27m%20interested%20in%20your%20courses%20and%20payment%20options.`;
  const youtubeUrl = 'https://youtube.com/@zolainforlanguagetranslationan?si=ZPeYlG7jH-eCzthe';
  const telegramUrl = 'https://t.me/zolain';
  const instagramUrl = 'https://instagram.com/zolain';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title + Tagline */}
            <Link to="/" className="flex items-center space-x-2 min-w-0" onClick={closeMenu}>
              <img
                src="/logo.jpeg"
                alt="Zolain"
                className="w-10 h-10 object-contain rounded-xl shadow-lg flex-shrink-0"
              />
              <div className="flex flex-col items-start leading-tight min-w-0">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Zolain
                </span>
                <span className="text-[0.7rem] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-normal leading-tight">
                  For Languages, Translation, and Training
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                Courses
              </Link>
              <Link to="/instructors" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                Instructors
              </Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                Contact
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200 font-medium">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg font-medium">
                  Register
                </Button>
              </Link>
            </div>

            {/* Right side actions (theme toggle + mobile menu) */}
            <div className="flex items-center space-x-2 md:space-x-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-gray-700 dark:text-gray-200" /> : <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/courses"
                  onClick={closeMenu}
                  className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
                >
                  Courses
                </Link>
                <Link
                  to="/instructors"
                  onClick={closeMenu}
                  className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
                >
                  Instructors
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
                >
                  Contact
                </Link>
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-gray-800 dark:text-gray-200">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Zolain. All rights reserved.
              <br />
              <span className="text-xs mt-1 block">Khartoum, Sudan | info@zolain.com</span>
            </div>

            {/* Social Media Icons - Static brand colors */}
            <div className="flex items-center space-x-4">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-md"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition-all duration-200 shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;