// Import React and useState for component state
import React, { useState } from 'react';
// Import React Router hooks for navigation
import { Link, useLocation } from 'react-router-dom';
// Import Framer Motion for animations
import { motion, AnimatePresence } from 'framer-motion';
// Import icons from Lucide React
import { Menu, X, Upload, Map, Leaf } from 'lucide-react';
// Import ThemeToggle component
import ThemeToggle from './ThemeToggle';
// Import Redux selector hook
import { useAppSelector } from '../../redux/store';
// Import custom media query hook
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Header component - Main navigation header with logo, nav links, and theme toggle
 * Responsive design with mobile menu
 */
const Header = () => {
  // Get current location for active link highlighting
  const location = useLocation();
  // Check if device is mobile
  const isMobile = useIsMobile();
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Get plant count from Redux state for badge display
  const plantCount = useAppSelector((state) => state.plants.plants.length);

  // Navigation links configuration
  const navLinks = [
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/farm', label: 'Farm Map', icon: Map },
    { path: '/plants', label: 'Plants', icon: Leaf },
  ];

  /**
   * Check if a navigation path is currently active
   * @param {string} path - Navigation path to check
   * @returns {boolean} Whether the path matches current location
   */
  const isActive = (path) => location.pathname === path;

  return (
    // Animated header that slides down from top
    <motion.header
      // Start above viewport
      initial={{ y: -100 }}
      // Animate to normal position
      animate={{ y: 0 }}
      // Sticky positioning with backdrop blur effect
      className="sticky top-0 z-50 shadow-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
    >
      {/* Container with responsive padding */}
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand section */}
          <Link to="/" className="flex items-center gap-2">
            {/* Animated leaf icon that rotates on hover */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="w-8 h-8 text-primary-600" />
            </motion.div>
            {/* Brand name */}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Farm Geotag
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              {/* Map over navigation links */}
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="relative group"
                >
                  <div className="flex items-center gap-2 px-4 py-2">
                    {/* Navigation icon */}
                    <Icon className="w-4 h-4" />
                    {/* Navigation label with conditional styling */}
                    <span className={`font-medium transition-colors ${
                      isActive(path)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {/* Active indicator bar with layout animation */}
                  {isActive(path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                    />
                  )}
                </Link>
              ))}

              {/* Plant count badge - Only show if plants exist */}
              {plantCount > 0 && (
                <motion.div
                  // Scale animation when appearing
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30"
                >
                  <Leaf className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                    {plantCount}
                  </span>
                </motion.div>
              )}

              {/* Theme toggle button */}
              <ThemeToggle />
            </nav>
          )}

          {/* Mobile Menu Button - Only show on mobile */}
          {isMobile && (
            <div className="flex items-center gap-3">
              {/* Theme toggle for mobile */}
              <ThemeToggle />
              {/* Hamburger menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                aria-label="Toggle menu"
              >
                {/* Conditional icon based on menu state */}
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - Animated dropdown */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.nav
            // Animate height and opacity for smooth expand/collapse
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            // Menu styling
            className="overflow-hidden bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="container px-4 py-4 mx-auto space-y-2">
              {/* Map over navigation links for mobile menu */}
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  // Close menu when link is clicked
                  onClick={() => setIsMenuOpen(false)}
                  // Conditional styling for active state
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {/* Navigation icon */}
                  <Icon className="w-5 h-5" />
                  {/* Navigation label */}
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// Export Header component as default
export default Header;