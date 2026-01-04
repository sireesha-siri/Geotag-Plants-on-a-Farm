// Import axios for HTTP requests
import axios from 'axios';

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; // Cloud name for Cloudinary account
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // Upload preset for unsigned uploads
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`; // Full upload URL

// Maximum allowed file size for uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Compress image before upload to reduce file size
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for compression (default: 1920)
 * @returns {Promise<File>} Promise resolving to compressed File
 */
const compressImage = (file, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    // Read file as data URL for processing
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      // Create image element to get dimensions
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Create canvas for image manipulation
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

        // Convert canvas to compressed JPEG blob
        canvas.toBlob(
          (blob) => {
            // Create new File from blob with original name
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg', // Output format
          0.85 // Quality setting (85%)
        );
      };

      // Handle image loading errors
      img.onerror = reject;
    };

    // Handle file reading errors
    reader.onerror = reject;
  });
};

/**
 * Upload image to Cloudinary with progress tracking
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Callback function for upload progress (0-100)
 * @returns {Promise<Object>} Promise resolving to upload result with URL and metadata
 */
export const uploadToCloudinary = async (file, onProgress) => {
  try {
    // Validate file size before upload
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and HEIC are supported.');
    }

    // Compress image to reduce upload size
    const compressedFile = await compressImage(file);

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'farm-geotag'); // Organize uploads in specific folder

    // Upload with axios and progress tracking
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // Calculate and report upload progress
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) {
          onProgress(progress);
        }
      },
    });

    // Return upload result metadata
    return {
      url: response.data.secure_url, // HTTPS URL of uploaded image
      publicId: response.data.public_id, // Unique public ID
      format: response.data.format, // Image format
      width: response.data.width, // Image width
      height: response.data.height, // Image height
    };
  } catch (error) {
    // Log error for debugging
    console.error('Cloudinary upload error:', error);

    // Provide user-friendly error messages
    if (error.response) {
      throw new Error(`Upload failed: ${error.response.data.error?.message || 'Server error'}`);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Desired width (default: 400)
 * @param {number} options.quality - Quality percentage (default: 80)
 * @param {string} options.format - Output format (default: 'auto')
 * @returns {string} Optimized URL with transformations applied
 */
export const optimizeImageUrl = (url, options = {}) => {
  // Destructure options with defaults
  const { width = 400, quality = 80, format = 'auto' } = options;

  // Return original URL if not a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Split URL at upload path to insert transformations
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  // Build transformation string
  const transformations = `w_${width},q_${quality},f_${format},c_limit`;
  // Insert transformations into URL
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};