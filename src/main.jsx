// Import React library for building user interfaces
import React from 'react';
// Import ReactDOM for rendering React components to the DOM
import ReactDOM from 'react-dom/client';
// Import main App component
import App from './App';
// Import global CSS styles
import './index.css';
// Import Leaflet CSS for map styling
import 'leaflet/dist/leaflet.css';
// Import marker cluster styles for map performance
import 'react-leaflet-markercluster/dist/styles.min.css';

/**
 * Main entry point for the React application
 * Renders the App component into the DOM using React 18's createRoot API
 * Includes StrictMode for development warnings and CSS imports for styling
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
