// Import React and useState for component state
import React, { useState } from 'react';
// Import React Router for navigation
import { useNavigate } from 'react-router-dom';
// Import Framer Motion for animations
import { motion, AnimatePresence } from 'framer-motion';
// Import toast notifications
import { toast } from 'react-toastify';
// Import icons from Lucide React
import { Upload as UploadIcon } from 'lucide-react';
// Import upload components
import UploadZone from './UploadZone';
import ImagePreview from './ImagePreview';
import LoadingSpinner from '../common/LoadingSpinner';
// Import Redux dispatch hook
import { useAppDispatch } from '../../redux/store';
// Import Redux actions for upload state management
import {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
} from '../../redux/slices/plantsSlice';
// Import service functions
import { uploadToCloudinary } from '../../services/cloudinary';
import { extractCoordinates, savePlantData } from '../../services/api';
// Import utility function
import { generateId } from '../../utils/helpers';

/**
 * ImageUpload component - Main upload interface for plant images
 * Handles file selection, upload to Cloudinary, coordinate extraction, and data saving
 */
const ImageUpload = () => {
  // Navigation hook for redirecting after upload
  const navigate = useNavigate();
  // Redux dispatch for state management
  const dispatch = useAppDispatch();
  // State for selected files
  const [files, setFiles] = useState([]);
  // State for upload progress and status per file
  const [uploadStatuses, setUploadStatuses] = useState({});
  // State for overall uploading flag
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Handle files selected from UploadZone
   * Filters duplicates and updates state
   * @param {File[]} selectedFiles - Valid selected files
   * @param {Object[]} errors - Validation errors
   */
  const handleFilesSelected = (selectedFiles, errors) => {
    // Show error toasts for invalid files
    if (errors.length > 0) {
      errors.forEach(({ file, error }) => {
        toast.error(`${file}: ${error}`);
      });
    }

    // Process valid files
    if (selectedFiles.length > 0) {
      // Filter out duplicates based on name and size
      const newFiles = selectedFiles.filter(
        newFile => !files.some(f => f.name === newFile.name && f.size === newFile.size)
      );

      // Notify if some files were duplicates
      if (newFiles.length < selectedFiles.length) {
        toast.info('Some files were already added');
      }

      // Add new files to state
      setFiles(prev => [...prev, ...newFiles]);

      // Initialize upload statuses for new files
      const newStatuses = {};
      newFiles.forEach(file => {
        newStatuses[file.name] = { progress: 0, status: 'pending' };
      });
      setUploadStatuses(prev => ({ ...prev, ...newStatuses }));
    }
  };

  /**
   * Remove a file from the selection
   * @param {string} fileName - Name of file to remove
   */
  const handleRemoveFile = (fileName) => {
    // Remove from files array
    setFiles(prev => prev.filter(f => f.name !== fileName));
    // Remove from upload statuses
    setUploadStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[fileName];
      return newStatuses;
    });
  };

  /**
   * Upload a single file through the complete pipeline
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Upload result with success status and data/error
   */
  const uploadSingleFile = async (file) => {
    const fileName = file.name;

    try {
      // Update status to uploading
      setUploadStatuses(prev => ({
        ...prev,
        [fileName]: { progress: 0, status: 'uploading' }
      }));
      // Dispatch Redux action to start upload tracking
      dispatch(uploadStart(fileName));

      // Step 1: Upload to Cloudinary with progress callback
      const cloudinaryResult = await uploadToCloudinary(file, (progress) => {
        // Update local state progress
        setUploadStatuses(prev => ({
          ...prev,
          [fileName]: { progress, status: 'uploading' }
        }));
        // Dispatch Redux progress update
        dispatch(uploadProgress({ imageName: fileName, progress }));
      });

      // Step 2: Extract coordinates from image
      const extractResult = await extractCoordinates(fileName, cloudinaryResult.url);

      if (!extractResult.success) {
        throw new Error(extractResult.error || 'Failed to extract coordinates');
      }

      const { latitude, longitude } = extractResult.data;

      // Step 3: Save plant data to backend
      const plantData = {
        imageName: fileName,
        imageUrl: cloudinaryResult.url,
        latitude,
        longitude,
      };

      const saveResult = await savePlantData(plantData);

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save plant data');
      }

      // Success! Create final plant data object
      const finalPlantData = {
        id: saveResult.data.id || generateId(),
        imageName: fileName,
        imageUrl: cloudinaryResult.url,
        latitude,
        longitude,
        uploadedAt: saveResult.data.uploadedAt || new Date().toISOString(),
      };

      // Dispatch success action to Redux
      dispatch(uploadSuccess(finalPlantData));
      // Update local status
      setUploadStatuses(prev => ({
        ...prev,
        [fileName]: { progress: 100, status: 'success' }
      }));

      // Show success toast
      toast.success(`${fileName} uploaded successfully!`);
      return { success: true, data: finalPlantData };
    } catch (error) {
      // Log error for debugging
      console.error(`Upload error for ${fileName}:`, error);

      // Dispatch failure action to Redux
      dispatch(uploadFailure({ imageName: fileName, error: error.message }));
      // Update local status to error
      setUploadStatuses(prev => ({
        ...prev,
        [fileName]: { progress: 0, status: 'error' }
      }));

      // Show error toast
      toast.error(`Failed to upload ${fileName}: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  /**
   * Handle upload all button click
   * Uploads all selected files concurrently
   */
  const handleUploadAll = async () => {
    // Validate that files are selected
    if (files.length === 0) {
      toast.warning('Please select at least one image');
      return;
    }

    // Set uploading state
    setIsUploading(true);

    // Upload all files concurrently using Promise.allSettled
    const results = await Promise.allSettled(
      files.map(file => uploadSingleFile(file))
    );

    // Count successes and failures
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    // Clear uploading state
    setIsUploading(false);

    // Show success message and navigate if any succeeded
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} plant(s)!`);

      // Navigate to farm view after delay
      setTimeout(() => {
        navigate('/farm');
      }, 1500);
    }

    // Show failure message if any failed
    if (failCount > 0) {
      toast.error(`${failCount} upload(s) failed`);
    }
  };

  // Computed values for UI state
  const hasFiles = files.length > 0;
  const allSuccess = hasFiles && Object.values(uploadStatuses).every(s => s.status === 'success');
  const canUpload = hasFiles && !isUploading && Object.values(uploadStatuses).every(s => s.status === 'pending' || s.status === 'error');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Upload Plant Images
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload images with GPS data to track your plants on the farm
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UploadZone onFilesSelected={handleFilesSelected} />
      </motion.div>

      {/* File preview section - only show when files are selected */}
      {hasFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          {/* Header with count and upload button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Selected Images ({files.length})
            </h2>

            {/* Upload all button - only show when can upload */}
            {canUpload && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUploadAll}
                className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-colors rounded-lg shadow-lg bg-primary-600 hover:bg-primary-700"
              >
                <UploadIcon className="w-5 h-5" />
                Upload All
              </motion.button>
            )}

            {/* Uploading indicator */}
            {isUploading && (
              <div className="flex items-center gap-3 px-6 py-3 text-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">
                <LoadingSpinner size="sm" />
                <span className="font-medium">Uploading...</span>
              </div>
            )}

            {/* Success indicator */}
            {allSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 text-green-700 rounded-lg bg-green-50 dark:bg-green-900/20 dark:text-green-300"
              >
                <span className="font-medium">All uploads complete!</span>
              </motion.div>
            )}
          </div>

          {/* Grid of image previews */}
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {files.map(file => (
                <ImagePreview
                  key={file.name}
                  file={file}
                  progress={uploadStatuses[file.name]?.progress || 0}
                  status={uploadStatuses[file.name]?.status || 'pending'}
                  onRemove={() => handleRemoveFile(file.name)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Export ImageUpload component as default
export default ImageUpload;