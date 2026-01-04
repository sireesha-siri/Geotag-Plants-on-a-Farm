// Import React and useEffect for side effects
import React, { useEffect, useState } from 'react';
// Import React Router hook for location
import { useLocation } from 'react-router-dom';
// Import Framer Motion for page transitions
import { motion, AnimatePresence } from 'framer-motion';
// Import Toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import Header component
import Header from './Header';
// Import LoadingSpinner component
import LoadingSpinner from './LoadingSpinner';
// Import Redux selector
import { useAppSelector } from '../../redux/store';

/**
 * Layout component - Main application layout wrapper
 * Provides consistent structure with header, animated content, and notifications
 * @param {ReactNode} children - Child components to render in main content area
 */
const Layout = ({ children }) => {
  // Get current location for page transition keys
  const location = useLocation();
  // Get current theme for toast styling
  const theme = useAppSelector((state) => state.theme.mode);
  // State to manage initial loading overlay
  const [isLoading, setIsLoading] = useState(true);

  // Effect to hide loading spinner after initial mount with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show content after 500ms max

    return () => clearTimeout(timer);
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Render loading overlay on initial app load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgLight dark:bg-bgDark">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    // Main container with theme-based background
    <div className="min-h-screen bg-bgLight dark:bg-bgDark">
      {/* Application header */}
      <Header />

      {/* Animated main content area */}
      <AnimatePresence mode="wait">
        <motion.main
          // Use pathname as key for page transitions
          key={location.pathname}
          // Initial animation state
          initial={{ opacity: 0, y: 20 }}
          // Animate to visible state
          animate={{ opacity: 1, y: 0 }}
          // Exit animation
          exit={{ opacity: 0, y: -20 }}
          // Transition timing
          transition={{ duration: 0.3 }}
          // Content container styling
          className="container px-4 py-6 mx-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Toast notification container */}
      <ToastContainer
        // Position in bottom right
        position="bottom-right"
        // Auto close after 3 seconds
        autoClose={3000}
        // Show progress bar
        hideProgressBar={false}
        // Show newest on top
        newestOnTop
        // Allow click to close
        closeOnClick
        // Not right-to-left
        rtl={false}
        // Pause when window loses focus
        pauseOnFocusLoss
        // Allow dragging
        draggable
        // Pause on hover
        pauseOnHover
        // Use current theme for styling
        theme={theme}
      />
    </div>
  );
};

// Export Layout component as default
export default Layout;