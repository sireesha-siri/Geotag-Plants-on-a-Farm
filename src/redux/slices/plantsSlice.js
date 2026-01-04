// Import Redux Toolkit's createSlice for defining the slice
import { createSlice } from '@reduxjs/toolkit';
// Import utility to save plants data to local storage
import { savePlantsToLocal } from '../../utils/storage';

/**
 * Redux slice for managing plants state
 * Handles plant uploads, fetching, deletion, filtering, and selection
 */
const plantsSlice = createSlice({
  // Name of the slice for action type generation
  name: 'plants',
  // Initial state structure
  initialState: {
    plants: [], // Array of plant objects
    loading: false, // Loading state for async operations
    uploadProgress: {}, // Object tracking upload progress by image name
    error: null, // Error message for failed operations
    filters: {
      sortBy: 'date', // Current sort criteria
      searchTerm: '', // Current search term
    },
    selectedPlant: null, // Currently selected plant for detail view
    uploadQueue: [], // Queue of files being uploaded in batch
  },
  reducers: {
    /**
     * Start tracking upload progress for a specific image
     * @param {object} state - Current state
     * @param {object} action - Action payload with image name
     */
    uploadStart: (state, action) => {
      // Initialize progress to 0 for the uploading image
      state.uploadProgress[action.payload] = 0;
    },
    /**
     * Update upload progress for an image
     * @param {object} state - Current state
     * @param {object} action - Action payload with imageName and progress
     */
    uploadProgress: (state, action) => {
      const { imageName, progress } = action.payload;
      // Update progress percentage for the image
      state.uploadProgress[imageName] = progress;
    },
    /**
     * Handle successful plant upload
     * @param {object} state - Current state
     * @param {object} action - Action payload with uploaded plant data
     */
    uploadSuccess: (state, action) => {
      // Add new plant to the beginning of the array
      state.plants.unshift(action.payload);
      // Remove progress tracking for this image
      delete state.uploadProgress[action.payload.imageName];
      // Persist updated plants to local storage
      savePlantsToLocal(state.plants);
    },
    /**
     * Handle failed plant upload
     * @param {object} state - Current state
     * @param {object} action - Action payload with imageName and error
     */
    uploadFailure: (state, action) => {
      const { imageName, error } = action.payload;
      // Remove progress tracking for failed upload
      delete state.uploadProgress[imageName];
      // Set error state
      state.error = error;
    },
    /**
     * Start batch upload process
     * @param {object} state - Current state
     * @param {object} action - Action payload with array of files to upload
     */
    batchUploadStart: (state, action) => {
      // Set upload queue and loading state
      state.uploadQueue = action.payload;
      state.loading = true;
    },
    /**
     * Start fetching plants from server/storage
     * @param {object} state - Current state
     */
    fetchPlantsStart: (state) => {
      // Set loading and clear any previous errors
      state.loading = true;
      state.error = null;
    },
    /**
     * Handle successful plants fetch
     * @param {object} state - Current state
     * @param {object} action - Action payload with fetched plants array
     */
    fetchPlantsSuccess: (state, action) => {
      // Update plants array and stop loading
      state.plants = action.payload;
      state.loading = false;
      // Persist to local storage
      savePlantsToLocal(state.plants);
    },
    /**
     * Handle failed plants fetch
     * @param {object} state - Current state
     * @param {object} action - Action payload with error message
     */
    fetchPlantsFailure: (state, action) => {
      // Stop loading and set error
      state.loading = false;
      state.error = action.payload;
    },
    /**
     * Start plant deletion process
     * @param {object} state - Current state
     */
    deletePlantStart: (state) => {
      // Set loading state
      state.loading = true;
    },
    /**
     * Handle successful plant deletion
     * @param {object} state - Current state
     * @param {object} action - Action payload with plant ID to delete
     */
    deletePlantSuccess: (state, action) => {
      // Remove plant from array by ID
      state.plants = state.plants.filter(p => p.id !== action.payload);
      state.loading = false;
      // Persist updated plants
      savePlantsToLocal(state.plants);
    },
    /**
     * Handle failed plant deletion
     * @param {object} state - Current state
     * @param {object} action - Action payload with error message
     */
    deletePlantFailure: (state, action) => {
      // Stop loading and set error
      state.loading = false;
      state.error = action.payload;
    },
    /**
     * Update filter settings
     * @param {object} state - Current state
     * @param {object} action - Action payload with filter updates
     */
    setFilters: (state, action) => {
      // Merge new filters with existing ones
      state.filters = { ...state.filters, ...action.payload };
    },
    /**
     * Set the currently selected plant for detail view
     * @param {object} state - Current state
     * @param {object} action - Action payload with plant object or null
     */
    setSelectedPlant: (state, action) => {
      // Update selected plant
      state.selectedPlant = action.payload;
    },
    /**
     * Clear any error state
     * @param {object} state - Current state
     */
    clearError: (state) => {
      // Reset error to null
      state.error = null;
    },
  },
});

// Export action creators generated by createSlice
export const {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  batchUploadStart,
  fetchPlantsStart,
  fetchPlantsSuccess,
  fetchPlantsFailure,
  deletePlantStart,
  deletePlantSuccess,
  deletePlantFailure,
  setFilters,
  setSelectedPlant,
  clearError,
} = plantsSlice.actions;

// Export the reducer function
export default plantsSlice.reducer;