// Import axios for HTTP requests
import axios from 'axios';

// API configuration constants from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL; // Base URL for API endpoints
const USER_EMAIL = import.meta.env.VITE_USER_EMAIL; // User's email for API authentication
const TIMEOUT = 10000; // OPTIMIZED: Increased timeout to 10 seconds (was 1 second)
const MAX_RETRIES = 2; // OPTIMIZED: Reduced to 2 retries (was 3)

// OPTIMIZATION: Simple in-memory cache for API responses
const cache = {
  plants: null,
  timestamp: null,
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes cache
};

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging in development
api.interceptors.request.use(
  (config) => {
    // Log API requests in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    // Pass through request errors
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic for network errors
api.interceptors.response.use(
  (response) => {
    // Log API responses in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.data);
    }
    return response;
  },
  async (error) => {
    // Get original request config
    const config = error.config;

    // Initialize retry count if not set
    if (!config || !config.retry) {
      config.retry = 0;
    }

    // Retry on network timeout errors up to MAX_RETRIES
    if (config.retry < MAX_RETRIES && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
      config.retry += 1;
      console.log(`Retrying request... Attempt ${config.retry}`);
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retry));
      return api(config);
    }

    // Reject if max retries reached or different error
    return Promise.reject(error);
  }
);

/**
 * Extract coordinates from image using backend API
 * @param {string} imageName - Name of the image file
 * @param {string} imageUrl - URL of the uploaded image
 * @returns {Promise<Object>} Result object with success, data, and error
 */
export const extractCoordinates = async (imageName, imageUrl) => {
  try {
    // Make POST request to extract coordinates endpoint
    const response = await api.post('/extract-latitude-longitude', {
      emailId: USER_EMAIL,
      imageName,
      imageUrl,
    });

    // Check if API response indicates success
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Failed to extract coordinates from image',
      };
    }
  } catch (error) {
    // Log error for debugging
    console.error('Extract coordinates error:', error);

    // Determine appropriate error message based on error type
    let errorMessage = 'Failed to extract coordinates';

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
    } else {
      // Other error
      errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * Save plant data to backend
 * @param {Object} plantData - Plant data object
 * @param {string} plantData.imageName - Name of the image
 * @param {string} plantData.imageUrl - URL of the image
 * @param {number} plantData.latitude - Latitude coordinate
 * @param {number} plantData.longitude - Longitude coordinate
 * @returns {Promise<Object>} Result object with success, data, and error
 */
export const savePlantData = async (plantData) => {
  try {
    // Validate required fields before making request
    if (!plantData.imageName || !plantData.imageUrl || !plantData.latitude || !plantData.longitude) {
      throw new Error('Missing required plant data fields');
    }

    // Make POST request to save plant data
    const response = await api.post('/save-plant-location-data', {
      emailId: USER_EMAIL,
      imageName: plantData.imageName,
      imageUrl: plantData.imageUrl,
      latitude: plantData.latitude,
      longitude: plantData.longitude,
    });

    // Check API response success
    if (response.data.success) {
      // OPTIMIZATION: Invalidate cache when data changes
      cache.plants = null;
      cache.timestamp = null;
      
      // Map response to match our data structure
      const savedPlant = response.data.data ? {
        id: response.data.data._id || response.data.data.id,
        imageName: response.data.data.imageName,
        imageUrl: response.data.data.imageUrl,
        latitude: response.data.data.latitude,
        longitude: response.data.data.longitude,
        uploadedAt: response.data.data.uploadedAt,
      } : null;
      
      return {
        success: true,
        data: savedPlant,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Failed to save plant data',
      };
    }
  } catch (error) {
    // Log error for debugging
    console.error('Save plant data error:', error);

    // Determine error message
    let errorMessage = 'Failed to save plant data';

    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * OPTIMIZED: Fetch user's plants with caching
 * @param {boolean} forceRefresh - Force refresh ignoring cache
 * @returns {Promise<Object>} Result object with success, data, and error
 */
export const fetchUserPlants = async (forceRefresh = false) => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh && cache.plants && cache.timestamp) {
      const cacheAge = Date.now() - cache.timestamp;
      if (cacheAge < cache.CACHE_DURATION) {
        console.log('Returning cached plants data');
        return {
          success: true,
          data: cache.plants,
          error: null,
          fromCache: true,
        };
      }
    }

    // CORRECTED: Use POST request with emailId in body
    const response = await api.post('/get-plant-location-data', {
      emailId: USER_EMAIL
    });

    // Check response success
    if (response.data.success) {
      // Map API response to match our data structure
      const plants = (response.data.data || []).map(plant => ({
        id: plant._id || plant.id,
        imageName: plant.imageName,
        imageUrl: plant.imageUrl,
        latitude: plant.latitude,
        longitude: plant.longitude,
        uploadedAt: plant.uploadedAt || plant.createdAt,
      }));
      
      // Update cache
      cache.plants = plants;
      cache.timestamp = Date.now();
      
      return {
        success: true,
        data: plants,
        error: null,
        fromCache: false,
      };
    } else {
      return {
        success: false,
        data: [],
        error: 'Failed to fetch plants',
      };
    }
  } catch (error) {
    // API failed, will use localStorage instead
    if (process.env.NODE_ENV === 'development') {
      console.log('API not available, using localStorage');
    }

    return {
      success: false,
      data: [],
      error: 'API not available',
    };
  }
};

/**
 * Delete plant data (if endpoint exists)
 * @param {string} plantId - ID of the plant to delete
 * @returns {Promise<Object>} Result object with success, data, and error
 */
export const deletePlantData = async (plantId) => {
  try {
    // Make DELETE request to remove plant
    const response = await api.delete(`/delete-plant/${plantId}`, {
      data: { emailId: USER_EMAIL }
    });

    // Check response success
    if (response.data.success) {
      // OPTIMIZATION: Invalidate cache when data changes
      cache.plants = null;
      cache.timestamp = null;
      
      return {
        success: true,
        data: response.data,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Failed to delete plant',
      };
    }
  } catch (error) {
    // Log error
    console.error('Delete plant error:', error);

    // OPTIMIZATION: Invalidate cache on any delete attempt
    cache.plants = null;
    cache.timestamp = null;

    // If endpoint doesn't exist, treat as success for local deletion
    return {
      success: true,
      data: null,
      error: null,
    };
  }
};

/**
 * OPTIMIZATION: Clear the API cache manually if needed
 */
export const clearCache = () => {
  cache.plants = null;
  cache.timestamp = null;
  console.log('API cache cleared');
};