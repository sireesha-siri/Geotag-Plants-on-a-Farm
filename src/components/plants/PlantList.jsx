// Import React hooks
import React, { useMemo, useState, useEffect } from 'react';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { Download, Leaf, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
 * ENHANCED: Advanced pagination with page size selection and jump to page
 */
const PlantList = () => {
  // Redux selectors for state management
  const allPlants = useAppSelector((state) => state.plants.plants);
  const filters = useAppSelector((state) => state.plants.filters);
  const loading = useAppSelector((state) => state.plants.loading);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Changed from 24 to 12 for easier testing
  const [jumpToPage, setJumpToPage] = useState('');

  // Memoized computation of filtered and sorted plants
  const displayedPlants = useMemo(() => {
    let filtered = filterPlants(allPlants, filters.searchTerm);
    return sortPlants(filtered, filters.sortBy);
  }, [allPlants, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(displayedPlants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlants = useMemo(() => {
    return displayedPlants.slice(startIndex, endIndex);
  }, [displayedPlants, startIndex, endIndex]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.sortBy, itemsPerPage]);

  // Ensure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /**
   * Handle page navigation
   */
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  /**
   * Handle jump to page input
   */
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
      setJumpToPage('');
    } else {
      toast.error(`Please enter a page between 1 and ${totalPages}`);
    }
  };

  /**
   * Handle items per page change
   */
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  /**
   * Generate page numbers for pagination
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  /**
   * Handle export functionality
   */
  const handleExport = (format) => {
    if (displayedPlants.length === 0) {
      toast.warning('No plants to export');
      return;
    }

    try {
      if (format === 'json') {
        exportToJSON(displayedPlants);
        toast.success(`Exported ${displayedPlants.length} plants as JSON`);
      } else if (format === 'csv') {
        exportToCSV(displayedPlants);
        toast.success(`Exported ${displayedPlants.length} plants as CSV`);
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Show loading state
  if (loading && allPlants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" text="Loading plants..." />
      </div>
    );
  }

  // Show empty state when no plants exist
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
      {/* Page header */}
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
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          {/* Export dropdown */}
          {displayedPlants.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Export
              </button>
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
          )}
        </div>

        {/* Filter panel */}
        <FilterPanel />

        {/* Pagination controls - Top */}
        {displayedPlants.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 mt-4 bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                per page
              </span>
            </div>

            {/* Page info */}
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1}-{Math.min(endIndex, displayedPlants.length)} of {displayedPlants.length}
            </div>

            {/* Jump to page - only show if multiple pages */}
            {totalPages > 1 && (
              <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Go to:
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  placeholder="Page"
                  className="w-20 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>

      {/* Plant grid */}
      {displayedPlants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {paginatedPlants.map((plant, index) => (
              <PlantCard key={plant.id} plant={plant} index={index} />
            ))}
          </div>

          {/* Pagination controls - Bottom */}
          {totalPages > 1 && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* First page button */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-600 dark:text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next page button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Last page button */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>

              {/* Page info - Bottom */}
              <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} • {displayedPlants.length} total plants
              </div>
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

export default PlantList;