// Import React for component creation
import React from 'react';
// Import Framer Motion for smooth animations
import { motion } from 'framer-motion';

/**
 * LoadingSpinner component - Animated loading indicator
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} text - Optional loading text to display below spinner
 */
const LoadingSpinner = ({ size = 'md', text = '' }) => {
  // Size mappings for different spinner sizes
  const sizes = {
    sm: 'w-4 h-4', // Small: 16x16px
    md: 'w-8 h-8', // Medium: 32x32px (default)
    lg: 'w-12 h-12', // Large: 48x48px
    xl: 'w-16 h-16', // Extra large: 64x64px
  };

  return (
    // Container with centered flex layout
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Animated spinner using border trick */}
      <motion.div
        // Apply size class and border styling for spinner effect
        className={`${sizes[size]} border-4 border-primary-200 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-500 rounded-full`}
        // Continuous rotation animation
        animate={{ rotate: 360 }}
        // Smooth linear rotation with infinite repeat
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        // Accessibility label
        aria-label="Loading"
      />
      {/* Optional loading text with fade-in animation */}
      {text && (
        <motion.p
          // Start invisible
          initial={{ opacity: 0 }}
          // Fade in to visible
          animate={{ opacity: 1 }}
          // Styling for text
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Export component as default
export default LoadingSpinner;