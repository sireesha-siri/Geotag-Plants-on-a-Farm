// Import React for component creation
import React from 'react';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * ImagePreview component - Displays preview of uploaded image with status
 * Shows file info, upload progress, and status indicators
 * @param {File} file - The image file object
 * @param {number} progress - Upload progress percentage (0-100)
 * @param {string} status - Upload status ('uploading', 'success', 'error', or default)
 * @param {Function} onRemove - Callback to remove the image
 */
const ImagePreview = ({ file, progress, status, onRemove }) => {
  /**
   * Get appropriate status icon based on upload status
   * @returns {JSX.Element|null} Status icon component
   */
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  /**
   * Get border color class based on upload status
   * @returns {string} Tailwind CSS border color classes
   */
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'border-blue-300 dark:border-blue-700';
      case 'success':
        return 'border-green-300 dark:border-green-700';
      case 'error':
        return 'border-red-300 dark:border-red-700';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 ${getStatusColor()} p-4 transition-all`}
    >
      {/* Remove Button */}
      {status !== 'uploading' && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Image Preview */}
      <div className="mb-3 overflow-hidden bg-gray-100 rounded-lg aspect-square dark:bg-gray-700">
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 text-sm font-medium text-gray-900 truncate dark:text-white">
            {file.name}
          </p>
          {getStatusIcon()}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-primary-600"
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Status Text */}
        {status === 'uploading' && (
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Uploading... {progress}%
          </p>
        )}
        {status === 'success' && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Upload complete!
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Upload failed
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ImagePreview;
