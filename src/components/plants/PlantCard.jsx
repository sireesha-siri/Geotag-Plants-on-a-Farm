// Import React hooks
import React, { useState } from 'react';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { MapPin, Trash2, Eye, Calendar } from 'lucide-react';
// Import React Router for navigation
import { useNavigate } from 'react-router-dom';
// Import toast notifications
import { toast } from 'react-toastify';
// Import Redux hooks and actions
import { useAppDispatch } from '../../redux/store';
import { deletePlantStart, deletePlantSuccess } from '../../redux/slices/plantsSlice';
// Import utility functions
import { formatCoordinates, formatDate, getOptimizedImageUrl } from '../../utils/helpers';
// Import API service
import { deletePlantData } from '../../services/api';

/**
 * PlantCard component - Displays individual plant information in a card format
 * Shows plant image, name, coordinates, upload date, and action buttons
 * @param {Object} plant - Plant object containing image data and metadata
 * @param {number} index - Index of the card for staggered animation timing
 */
const PlantCard = ({ plant, index }) => {
  // Navigation hook for routing
  const navigate = useNavigate();
  // Redux dispatch hook
  const dispatch = useAppDispatch();
  // Local state for image loading and deletion status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle plant deletion with confirmation dialog
   * @param {Event} e - Click event to prevent card navigation
   */
  const handleDelete = async (e) => {
    // Prevent card click navigation
    e.stopPropagation();

    // Show confirmation dialog
    if (!window.confirm(`Delete ${plant.imageName}?`)) {
      return;
    }

    // Set deleting state and dispatch start action
    setIsDeleting(true);
    dispatch(deletePlantStart());

    try {
      // Call API to delete plant
      await deletePlantData(plant.id);
      // Dispatch success action
      dispatch(deletePlantSuccess(plant.id));
      // Show success message
      toast.success('Plant deleted successfully');
    } catch (error) {
      // Show error message on failure
      toast.error('Failed to delete plant');
    } finally {
      // Clear deleting state
      setIsDeleting(false);
    }
  };

  /**
   * Navigate to farm map view to show this plant's location
   * @param {Event} e - Click event to prevent card navigation
   */
  const handleViewOnMap = (e) => {
    // Prevent card click navigation
    e.stopPropagation();
    // Navigate to farm map page
    navigate('/farm');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.01 }} // Reduced staggered animation delay for faster loading
      whileHover={{ y: -8 }} // Lift effect on hover
      className="overflow-hidden cursor-pointer card group"
    >
      {/* Image section with loading state */}
      <div className="relative overflow-hidden bg-gray-200 aspect-square dark:bg-gray-700">
        {/* Loading spinner shown while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 rounded-full border-primary-200 border-t-primary-600 animate-spin" />
          </div>
        )}

        {/* Plant image with hover zoom effect */}
        <motion.img
          src={getOptimizedImageUrl(plant.imageUrl, 400)} // Optimized image URL for performance
          alt={plant.imageName}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)} // Hide loading spinner when image loads
          whileHover={{ scale: 1.05 }} // Zoom effect on hover
          transition={{ duration: 0.3 }}
        />

        {/* Overlay with view button on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
          <a
            href={plant.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent card navigation
            className="p-3 transition-colors rounded-full bg-white/90 hover:bg-white"
          >
            <Eye className="w-5 h-5 text-gray-900" />
          </a>
        </div>
      </div>

      {/* Card content section */}
      <div className="p-4 space-y-3">
        {/* Plant name */}
        <h3 className="font-semibold text-gray-900 truncate dark:text-white">
          {plant.imageName}
        </h3>

        {/* Plant information */}
        <div className="space-y-2 text-sm">
          {/* Coordinates display */}
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="truncate">
              {formatCoordinates(plant.latitude, plant.longitude)}
            </span>
          </div>

          {/* Upload date display */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(plant.uploadedAt)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {/* View on map button */}
          <button
            onClick={handleViewOnMap}
            className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Export PlantCard component as default
export default PlantCard;