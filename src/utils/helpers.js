/**
 * Format date to relative or absolute string
 * @param {number} timestamp - The timestamp to format
 * @param {object} options - Options object
 * @param {boolean} options.relative - Whether to return relative time (default: true)
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp, options = { relative: true }) => {
  // Create Date objects for the given timestamp and current time
  const date = new Date(timestamp);
  const now = new Date();

  if (options.relative) {
    // Calculate time differences in milliseconds
    const diffMs = now - date;
    // Convert to minutes, hours, days
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Return appropriate relative time based on difference
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  }

  // Return absolute date format if not relative
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {string} Formatted coordinate string
 */
export const formatCoordinates = (lat, lng) => {
  // Determine direction for latitude and longitude
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  // Format with 5 decimal places and direction
  return `${Math.abs(lat).toFixed(5)}°${latDir}, ${Math.abs(lng).toFixed(5)}°${lngDir}`;
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {object} Validation result with valid boolean and error message
 */
export const validateImage = (file) => {
  // Define allowed file types and maximum size
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Check if file type is valid
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, PNG, and HEIC are supported.'
    };
  }

  // Check if file size exceeds limit
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 5MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // File is valid
  return { valid: true, error: null };
};

/**
 * Compress image (browser-based)
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for compression (default: 1920)
 * @returns {Promise<File>} Promise resolving to compressed File
 */
export const compressImage = (file, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    // Read file as data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      // Create image element and set source
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Create canvas for drawing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if width exceeds maxWidth, maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with JPEG compression
        canvas.toBlob(
          (blob) => {
            // Create new File from blob
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.85 // Quality setting
        );
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
};

/**
 * Get map bounds from plant coordinates
 * @param {Array} plants - Array of plant objects with latitude and longitude
 * @returns {Array|null} Bounds array [[minLat, minLng], [maxLat, maxLng]] or null if empty
 */
export const getBounds = (plants) => {
  // Return null if no plants or empty array
  if (!plants || plants.length === 0) {
    return null;
  }

  // Extract latitudes and longitudes
  const latitudes = plants.map(p => p.latitude);
  const longitudes = plants.map(p => p.longitude);

  // Return bounds as array of min/max coordinates
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)]
  ];
};

/**
 * Sort plants array
 * @param {Array} plants - Array of plant objects
 * @param {string} sortBy - Sort criteria ('date', 'latitude', 'longitude', 'name')
 * @returns {Array} Sorted array of plants
 */
export const sortPlants = (plants, sortBy) => {
  // Create copy to avoid mutating original
  const sorted = [...plants];

  // Sort based on criteria
  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    case 'latitude':
      return sorted.sort((a, b) => b.latitude - a.latitude);
    case 'longitude':
      return sorted.sort((a, b) => b.longitude - a.longitude);
    case 'name':
      return sorted.sort((a, b) => a.imageName.localeCompare(b.imageName));
    default:
      return sorted; // No sorting if invalid criteria
  }
};

/**
 * Filter plants by search term
 * @param {Array} plants - Array of plant objects
 * @param {string} searchTerm - Term to search for in plant names
 * @returns {Array} Filtered array of plants
 */
export const filterPlants = (plants, searchTerm) => {
  // Return all if no search term
  if (!searchTerm) return plants;

  // Convert to lowercase for case-insensitive search
  const term = searchTerm.toLowerCase();
  // Filter plants whose name includes the search term
  return plants.filter(plant =>
    plant.imageName.toLowerCase().includes(term)
  );
};

/**
 * Generate unique ID
 * @returns {string} Unique identifier string
 */
export const generateId = () => {
  // Use crypto.randomUUID if available, fallback to timestamp + random
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    // Clear previous timeout
    clearTimeout(timeoutId);
    // Set new timeout to call function after delay
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get optimized Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width (default: 400)
 * @param {number} quality - Quality percentage (default: 80)
 * @returns {string} Optimized URL with transformations
 */
export const getOptimizedImageUrl = (url, width = 400, quality = 80) => {
  // Return original if not Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Split URL at upload path
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  // Add transformations for width, quality, auto format, and limit
  const transformations = `w_${width},q_${quality},f_auto,c_limit`;
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

/**
 * Export plants to JSON
 * @param {Array} plants - Array of plant objects to export
 */
export const exportToJSON = (plants) => {
  // Convert plants array to formatted JSON string
  const dataStr = JSON.stringify(plants, null, 2);
  // Create blob with JSON data
  const blob = new Blob([dataStr], { type: 'application/json' });
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plants-export-${new Date().toISOString().split('T')[0]}.json`;
  // Trigger download
  link.click();
  // Clean up URL
  URL.revokeObjectURL(url);
};

/**
 * Export plants to CSV
 * @param {Array} plants - Array of plant objects to export
 */
export const exportToCSV = (plants) => {
  // Define CSV headers
  const headers = ['Image Name', 'Image URL', 'Latitude', 'Longitude', 'Uploaded At'];
  // Map plants to CSV rows
  const rows = plants.map(p => [
    p.imageName,
    p.imageUrl,
    p.latitude,
    p.longitude,
    new Date(p.uploadedAt).toLocaleString()
  ]);

  // Combine headers and rows into CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob with CSV data
  const blob = new Blob([csvContent], { type: 'text/csv' });
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plants-export-${new Date().toISOString().split('T')[0]}.csv`;
  // Trigger download
  link.click();
  // Clean up URL
  URL.revokeObjectURL(url);
};
