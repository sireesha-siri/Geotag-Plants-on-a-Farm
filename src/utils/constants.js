// Map configuration constants for Leaflet map setup
export const MAP_CONFIG = {
  DEFAULT_CENTER: [15.97, 79.28], // Default map center coordinates [lat, lng]
  DEFAULT_ZOOM: 15, // Default zoom level
  MIN_ZOOM: 10, // Minimum allowed zoom level
  MAX_ZOOM: 18, // Maximum allowed zoom level
};

// Tile layer URLs for different map themes
export const TILE_LAYERS = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Light theme tiles from OpenStreetMap
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // Dark theme tiles from CartoDB
};

// File validation constants for image uploads
export const FILE_VALIDATION = {
  MAX_SIZE: 5 * 1024 * 1024, // Maximum file size in bytes (5MB)
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'], // Accepted MIME types
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.heic'], // Accepted file extensions
};

// Available sort options for plants list
export const SORT_OPTIONS = [
  { value: 'date', label: 'Upload Date' }, // Sort by upload timestamp
  { value: 'latitude', label: 'Latitude' }, // Sort by latitude coordinate
  { value: 'longitude', label: 'Longitude' }, // Sort by longitude coordinate
  { value: 'name', label: 'Name' }, // Sort by image name alphabetically
];