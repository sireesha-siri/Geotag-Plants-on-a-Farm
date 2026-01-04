// Storage key for localStorage to persist plants data
const STORAGE_KEY = 'farm-geotag-plants';

/**
 * Save plants array to localStorage
 * @param {Array} plants - Array of plant objects to save
 * @returns {boolean} Success status of the save operation
 */
export const savePlantsToLocal = (plants) => {
  try {
    // Serialize plants array to JSON and store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    return true;
  } catch (error) {
    // Log error if localStorage is unavailable or quota exceeded
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Load plants array from localStorage
 * @returns {Array} Array of plant objects, or empty array if none found or error
 */
export const loadPlantsFromLocal = () => {
  try {
    // Retrieve data from localStorage
    const data = localStorage.getItem(STORAGE_KEY);
    // Parse JSON data or return empty array if no data
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // Log error and return empty array on failure
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

/**
 * Clear plants data from localStorage
 * @returns {boolean} Success status of the clear operation
 */
export const clearLocalStorage = () => {
  try {
    // Remove the plants data from localStorage
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    // Log error if unable to remove item
    console.error('Failed to clear localStorage:', error);
    return false;
  }
};