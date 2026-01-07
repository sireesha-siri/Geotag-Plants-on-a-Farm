// Map configuration constants for Leaflet map setup
export const MAP_CONFIG = {
  DEFAULT_CENTER: [15.97, 79.28],
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 1,
  MAX_ZOOM: 22, // Realistic max zoom for satellite imagery
};

// Tile layer URLs for different map themes
export const TILE_LAYERS = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  // Add satellite imagery with higher zoom levels
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  // Alternative: Google Satellite (higher quality)
  googleSatellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  // Hybrid (satellite + labels)
  googleHybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
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