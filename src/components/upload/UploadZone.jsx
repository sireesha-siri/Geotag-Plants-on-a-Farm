// Import React and useCallback for memoized callbacks
import React, { useCallback } from 'react';
// Import react-dropzone for drag-and-drop functionality
import { useDropzone } from 'react-dropzone';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { Upload, Image as ImageIcon } from 'lucide-react';
// Import file validation constants
import { FILE_VALIDATION } from '../../utils/constants';
// Import image validation helper
import { validateImage } from '../../utils/helpers';

/**
 * UploadZone component - Drag-and-drop file upload area
 * Handles image file selection with validation and visual feedback
 * @param {Function} onFilesSelected - Callback when files are selected (validFiles, errors)
 */
const UploadZone = ({ onFilesSelected }) => {
  /**
   * Handle file drop event from react-dropzone
   * Validates files and calls parent callback with results
   */
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Arrays to collect valid files and errors
    const validFiles = [];
    const errors = [];

    // Validate each accepted file
    acceptedFiles.forEach(file => {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push({ file: file.name, error: validation.error });
      }
    });

    // Handle files rejected by dropzone (wrong type, too big, etc.)
    rejectedFiles.forEach(({ file, errors: dropErrors }) => {
      errors.push({
        file: file.name,
        error: dropErrors.map(e => e.message).join(', ')
      });
    });

    // Call parent callback with validated files and any errors
    onFilesSelected(validFiles, errors);
  }, [onFilesSelected]);

  // Initialize dropzone with configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accepted file types and extensions
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
    },
    // Maximum file size
    maxSize: FILE_VALIDATION.MAX_SIZE,
    // Allow multiple file selection
    multiple: true,
  });

  return (
    // Animated dropzone container
    <motion.div
      // Spread dropzone props for drag handling
      {...getRootProps()}
      // Hover scale animation
      whileHover={{ scale: 1.02 }}
      // Tap scale animation
      whileTap={{ scale: 0.98 }}
      // Dynamic styling based on drag state
      animate={{
        borderColor: isDragActive ? '#16a34a' : '#d1d5db',
        backgroundColor: isDragActive ? 'rgba(22, 163, 74, 0.05)' : 'transparent',
      }}
      // Base styling with conditional classes
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
        ${isDragActive
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
      // Minimum height for dropzone
      style={{ minHeight: '200px' }}
    >
      {/* Hidden file input */}
      <input {...getInputProps()} />

      {/* Content container */}
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {/* Animated icon */}
        <motion.div
          // Animate position and scale based on drag state
          animate={{
            y: isDragActive ? -10 : 0,
            scale: isDragActive ? 1.1 : 1,
          }}
          // Spring animation for smooth movement
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Conditional icon based on drag state */}
          {isDragActive ? (
            <ImageIcon className="w-16 h-16 text-primary-500" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          )}
        </motion.div>

        {/* Text content */}
        <div>
          {/* Dynamic heading based on drag state */}
          <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Drop images here' : 'Drag & drop plant images'}
          </p>
          {/* Subtext */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            or click to browse files
          </p>
        </div>

        {/* File requirements info */}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p>Supported formats: JPG, PNG, HEIC</p>
          <p>Maximum file size: 5MB per image</p>
          <p>Multiple files supported</p>
        </div>

        {/* Browse files button */}
        <motion.button
          type="button"
          // Button animations
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          // Button styling
          className="px-6 py-2 mt-4 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Browse Files
        </motion.button>
      </div>
    </motion.div>
  );
};

// Export UploadZone component as default
export default UploadZone;