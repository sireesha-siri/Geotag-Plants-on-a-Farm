// Import React for component creation
import React from 'react';
// Import Framer Motion for smooth animations
import { motion } from 'framer-motion';
// Import React Router hook (though not used in this component)
import { useNavigate } from 'react-router-dom';

/**
 * EmptyState component - Display when no data is available
 * @param {React.Component} icon - Icon component to display (e.g., from Lucide)
 * @param {string} title - Main heading text
 * @param {string} description - Descriptive text below title
 * @param {string} actionLabel - Text for action button (optional)
 * @param {Function} onAction - Callback function for action button click (optional)
 */
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  // Get navigate function from React Router (not currently used)
  const navigate = useNavigate();

  /**
   * Handle action button click
   * Calls the provided onAction callback if available
   */
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    // Animated container with fade-in and slide-up effect
    <motion.div
      // Start invisible and below final position
      initial={{ opacity: 0, y: 20 }}
      // Animate to visible and final position
      animate={{ opacity: 1, y: 0 }}
      // Centered layout with padding
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
    >
      {/* Animated icon with floating effect */}
      <motion.div
        // Floating animation: move up and down
        animate={{
          y: [0, -10, 0],
        }}
        // Smooth infinite animation
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        // Spacing below icon
        className="mb-4"
      >
        {/* Render icon if provided */}
        {Icon && <Icon className="w-16 h-16 text-primary-400 dark:text-primary-500" />}
      </motion.div>

      {/* Title heading */}
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      {/* Description text */}
      <p className="max-w-md mb-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {/* Optional action button */}
      {actionLabel && (
        <motion.button
          // Scale animation on hover
          whileHover={{ scale: 1.05 }}
          // Scale animation on tap
          whileTap={{ scale: 0.95 }}
          // Handle click
          onClick={handleAction}
          // Primary button styling
          className="btn-primary"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

// Export component as default
export default EmptyState;