// Import React
import React from 'react';
// Import Framer Motion for animations
import { motion } from 'framer-motion';
// Import icons from Lucide React
import { Search, X, SlidersHorizontal } from 'lucide-react';
// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setFilters } from '../../redux/slices/plantsSlice';
// Import constants and utilities
import { SORT_OPTIONS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';

/**
 * FilterPanel component - Provides filtering and sorting controls for the farm map
 * Includes search functionality, sort options, and filter management
 * @param {Function} onClose - Optional callback function to close the panel
 */
const FilterPanel = ({ onClose }) => {
  // Redux hooks for state management
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.plants.filters);
  const plantsCount = useAppSelector((state) => state.plants.plants.length);

  /**
   * Handle search input changes with debouncing to avoid excessive API calls
   * @param {string} value - The search term entered by the user
   */
  const handleSearchChange = debounce((value) => {
    dispatch(setFilters({ searchTerm: value }));
  }, 300);

  /**
   * Handle sort option changes
   * @param {string} value - The selected sort option value
   */
  const handleSortChange = (value) => {
    dispatch(setFilters({ sortBy: value }));
  };

  /**
   * Clear all active filters and reset to default state
   */
  const handleClearFilters = () => {
    dispatch(setFilters({ searchTerm: '', sortBy: 'date' }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-xl"
    >
      {/* Panel header with title and close button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>

        {/* Close button - only shown if onClose prop is provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="space-y-4">
        {/* Search input section */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Plants
          </label>
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              defaultValue={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by image name..."
              className="pl-10 input-field"
            />
          </div>
        </div>

        {/* Sort dropdown section */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field"
          >
            {/* Render sort options from constants */}
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count display */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-primary-600">{plantsCount}</span> plants
          </p>
        </div>

        {/* Clear filters button - only shown when filters are active */}
        {(filters.searchTerm || filters.sortBy !== 'date') && (
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 text-gray-900 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Export FilterPanel component as default
export default FilterPanel;