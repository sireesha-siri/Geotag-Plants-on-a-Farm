// Import React hooks
import React, { useMemo, useState, useEffect } from 'react';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { Download, Leaf } from 'lucide-react';
// Import toast notifications
import { toast } from 'react-toastify';
// Import child components
import PlantCard from './PlantCard';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import FilterPanel from '../map/FilterPanel';
// Import Redux hooks
import { useAppSelector } from '../../redux/store';
// Import utility functions for sorting, filtering, and exporting
import { sortPlants, filterPlants, exportToJSON, exportToCSV } from '../../utils/helpers';

/**
 * PlantList component - Main view for displaying all plants in a grid layout
 * OPTIMIZED: Faster rendering, better pagination, reduced animations
 */
const PlantList = () => {
  // Redux selectors for state management
  const allPlants = useAppSelector((state) => state.plants.plants);
  const filters = useAppSelector((state) => state.plants.filters);
  const loading = useAppSelector((state) => state.plants.loading);
  // Pagination state - OPTIMIZED: Increased items per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // Increased from 20 for better performance

  // Memoized computation of filtered and sorted plants for performance
  const displayedPlants = useMemo(() => {
    // First filter plants by search term
    let filtered = filterPlants(allPlants, filters.searchTerm);
    // Then sort the filtered results
    return sortPlants(filtered, filters.sortBy);
  }, [allPlants, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(displayedPlants.length / itemsPerPage);
  const paginatedPlants = useMemo(() => {
    return displayedPlants.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    );
  }, [displayedPlants, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.sortBy]);

  // Ensure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /**
   * Handle export functionality for plant data
   * @param {string} format - Export format ('json' or 'csv')
   */
  const handleExport = (format) => {
    // Check if there are plants to export
    if (displayedPlants.length === 0) {
      toast.warning('No plants to export');
      return;
    }

    try {
      // Export based on selected format
      if (format === 'json') {
        exportToJSON(displayedPlants);
        toast.success(`Exported ${displayedPlants.length} plants as JSON`);
      } else if (format === 'csv') {
        exportToCSV(displayedPlants);
        toast.success(`Exported ${displayedPlants.length} plants as CSV`);
      }
    } catch (error) {
      // Handle export errors
      toast.error('Failed to export data');
    }
  };

  // OPTIMIZED: Show minimal loading when switching between pages
  if (loading && allPlants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" text="Loading plants..." />
      </div>
    );
  }

  // Show empty state when no plants exist at all
  if (allPlants.length === 0) {
    return (
      <EmptyState
        icon={Leaf}
        title="No plants yet"
        description="Upload your first plant image to get started tracking your farm"
        actionLabel="Upload Plants"
        onAction={() => window.location.href = '/upload'}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header with title and export functionality */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              All Plants
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {displayedPlants.length} plant{displayedPlants.length !== 1 ? 's' : ''} in your collection
              {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          {/* Export dropdown - only shown when there are plants to export */}
          {displayedPlants.length > 0 && (
            <div className="flex gap-2">
              <div className="relative group">
                {/* Export button with dropdown menu */}
                <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700">
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {/* Dropdown menu with export options */}
                <div className="absolute right-0 z-10 invisible w-48 mt-2 transition-all bg-white rounded-lg shadow-lg opacity-0 dark:bg-gray-800 group-hover:opacity-100 group-hover:visible">
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left transition-colors rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left transition-colors rounded-b-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter panel component */}
        <FilterPanel />
      </motion.div>

      {/* Plant grid or empty state */}
      {displayedPlants.length > 0 ? (
        <>
          {/* OPTIMIZED: Simplified grid without complex animations */}
          <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Render PlantCard for each paginated plant */}
            {paginatedPlants.map((plant, index) => (
              <PlantCard key={plant.id} plant={plant} index={index} />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        // Empty state when filters result in no matching plants
        <EmptyState
          icon={Leaf}
          title="No matching plants"
          description="Try adjusting your search or filters"
        />
      )}
    </div>
  );
};

// Export PlantList component as default
export default PlantList;