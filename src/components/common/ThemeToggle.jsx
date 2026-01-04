// Import React for component creation
import React from 'react';
// Import Framer Motion for smooth animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { Sun, Moon } from 'lucide-react';
// Import typed Redux hooks
import { useAppDispatch, useAppSelector } from '../../redux/store';
// Import theme toggle action
import { toggleTheme } from '../../redux/slices/themeSlice';

/**
 * ThemeToggle component - Button to switch between light and dark themes
 * Uses Redux for state management and Framer Motion for animations
 */
const ThemeToggle = () => {
  // Get dispatch function for Redux actions
  const dispatch = useAppDispatch();
  // Select current theme mode from Redux state
  const theme = useAppSelector((state) => state.theme.mode);
  // Determine if current theme is dark
  const isDark = theme === 'dark';

  /**
   * Handle theme toggle button click
   * Dispatches toggleTheme action to Redux store
   */
  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    // Animated button with hover and tap effects
    <motion.button
      onClick={handleToggle}
      // Styling with responsive classes for light/dark modes
      className="relative flex items-center justify-center w-12 h-12 transition-colors rounded-full bg-primary-100 dark:bg-gray-700 hover:bg-primary-200 dark:hover:bg-gray-600"
      // Scale animation on hover
      whileHover={{ scale: 1.05 }}
      // Scale animation on tap
      whileTap={{ scale: 0.95 }}
      // Accessibility label
      aria-label="Toggle theme"
    >
      {/* Animated icon container */}
      <motion.div
        // Disable initial animation
        initial={false}
        // Rotate based on theme (180 degrees for dark mode)
        animate={{ rotate: isDark ? 180 : 0 }}
        // Smooth transition duration
        transition={{ duration: 0.3 }}
      >
        {/* Conditional rendering of sun or moon icon */}
        {isDark ? (
          // Moon icon for dark theme
          <Moon className="w-5 h-5 text-yellow-300" />
        ) : (
          // Sun icon for light theme
          <Sun className="w-5 h-5 text-primary-600" />
        )}
      </motion.div>
    </motion.button>
  );
};

// Export component as default
export default ThemeToggle;