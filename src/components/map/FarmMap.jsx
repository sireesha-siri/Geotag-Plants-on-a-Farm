import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Image as ImageIcon, MapPin, ZoomIn, Search, X, Locate } from 'lucide-react';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { deletePlantStart, deletePlantSuccess } from '../../redux/slices/plantsSlice';
import { deletePlantData } from '../../services/api';
import { MAP_CONFIG, TILE_LAYERS } from '../../utils/constants';
import { formatCoordinates, formatDate, getOptimizedImageUrl, getBounds } from '../../utils/helpers';
import FilterPanel from './FilterPanel';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom plant marker icon (green)
const plantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMTZhMzRhIiBzdHJva2U9IiMxNmEzNGEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNyAyMGgxMCIvPjxwYXRoIGQ9Ik0xMCAyMGMxLjUtMi41IDEuNS02IDEuNS0xMEMxMS41IDYgMTAgNSA5LjUgNHMtMS41IDItMS41IDZ2MTBjMCAxIC41IDIgMiAyeiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Highlighted plant marker (amber/gold) - when selected
const highlightedPlantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZjU5ZTBiIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNyAyMGgxMCIvPjxwYXRoIGQ9Ik0xMCAyMGMxLjUtMi41IDEuNS02IDEuNS0xMEMxMS41IDYgMTAgNSA5LjUgNHMtMS41IDItMS41IDZ2MTBjMCAxIC41IDIgMiAyeiIvPjwvc3ZnPg==',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

/**
 * MapController - Controls map zoom and centering
 */
const MapController = ({ selectedPlant, plants, triggerFitBounds }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlant) {
      // Zoom to specific plant with smooth animation
      map.flyTo(
        [selectedPlant.latitude, selectedPlant.longitude],
        22, // Maximum zoom level for satellite imagery (very close view)
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      );
    } else if (triggerFitBounds && plants && plants.length > 0) {
      // Fit all plants in view
      try {
        const bounds = getBounds(plants);
        if (bounds && bounds[0] && bounds[1]) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16
          });
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [selectedPlant, plants, map, triggerFitBounds]);

  return null;
};

/**
 * PlantListSidebar - Sidebar showing all plants with search
 */
const PlantListSidebar = ({ plants, selectedPlant, onSelectPlant, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plants.filter(plant =>
    plant.imageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute left-0 top-0 z-[1000] h-full w-80 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5" />
          All Plants
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plants..."
            className="w-full py-2 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {filteredPlants.length} of {plants.length} plants
        </p>
      </div>

      {/* Plant list */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No plants found</p>
          </div>
        ) : (
          filteredPlants.map((plant) => (
            <motion.button
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedPlant?.id === plant.id
                  ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Plant thumbnail */}
                <div className="relative flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-200 rounded-lg dark:bg-gray-600">
                  <img
                    src={getOptimizedImageUrl(plant.imageUrl, 100)}
                    alt={plant.imageName}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Plant info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                    {plant.imageName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCoordinates(plant.latitude, plant.longitude)}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                    📍 Click to zoom
                  </p>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
};

/**
 * FarmMap component - Main map view with zoom functionality
 */
const FarmMap = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const allPlants = useAppSelector((state) => state.plants.plants);
  const filters = useAppSelector((state) => state.plants.filters);
  const loading = useAppSelector((state) => state.plants.loading);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPlantList, setShowPlantList] = useState(false);
  const [triggerFitBounds, setTriggerFitBounds] = useState(true);
  const [mapType, setMapType] = useState('satellite'); // 'light', 'dark', 'satellite', 'hybrid'

  // Filter plants
  const filteredPlants = allPlants.filter(plant =>
    !filters.searchTerm || plant.imageName.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  // Get tile layer based on map type
  const getTileLayer = () => {
    switch(mapType) {
      case 'satellite':
        return TILE_LAYERS.googleSatellite || TILE_LAYERS.satellite || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'hybrid':
        return TILE_LAYERS.googleHybrid || 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'dark':
        return TILE_LAYERS.dark;
      default:
        return TILE_LAYERS.light;
    }
  };

  const tileLayer = getTileLayer();

  /**
   * Handle plant deletion
   */
  const handleDeletePlant = async (plant) => {
    if (!window.confirm(`Delete ${plant.imageName}?`)) {
      return;
    }

    setDeletingId(plant.id);
    dispatch(deletePlantStart());

    try {
      await deletePlantData(plant.id);
      dispatch(deletePlantSuccess(plant.id));
      toast.success('Plant deleted successfully');

      // Clear selection if deleted plant was selected
      if (selectedPlant?.id === plant.id) {
        setSelectedPlant(null);
      }
    } catch (error) {
      toast.error('Failed to delete plant');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handle plant selection from sidebar
   */
  const handleSelectPlant = (plant) => {
    setSelectedPlant(plant);
    setShowPlantList(false); // Close sidebar after selection
    setTriggerFitBounds(false); // Don't auto-fit bounds
  };

  /**
   * Handle zoom to plant from popup
   */
  const handleZoomToPlant = (plant) => {
    setSelectedPlant(plant);
    setTriggerFitBounds(false);
  };

  /**
   * Reset view to show all plants
   */
  const handleResetView = () => {
    setSelectedPlant(null);
    setTriggerFitBounds(true);
  };

  // Show loading state
  if (loading && allPlants.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show empty state if no plants
  if (allPlants.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No Plants Yet"
        message="Upload your first plant to see it on the map"
        actionLabel="Upload Plant"
        onAction={() => window.location.href = '/upload'}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Farm Map
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''} on your farm
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show Plant List Button */}
            <button
              onClick={() => setShowPlantList(!showPlantList)}
              className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg shadow-lg bg-primary-600 hover:bg-primary-700"
            >
              {showPlantList ? 'Hide' : 'Show'} Plant List
            </button>

            {/* Map Type Selector */}
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
              className="px-4 py-2 font-medium text-white transition-colors rounded-lg shadow-lg cursor-pointer bg-primary-600 hover:bg-primary-700"
            >
              <option value="satellite">🛰️ Satellite</option>
              <option value="hybrid">🗺️ Hybrid</option>
              <option value="light">☀️ Street Map</option>
              <option value="dark">🌙 Dark Map</option>
            </select>

            {/* Reset View Button */}
            {selectedPlant && (
              <button
                onClick={handleResetView}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-amber-600 hover:bg-amber-700"
              >
                <Locate className="w-4 h-4" />
                View All Plants
              </button>
            )}

            {/* Filters Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 text-white transition-colors rounded-lg bg-secondary-600 hover:bg-secondary-700"
            >
              Filters {isFilterOpen ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {/* Selected Plant Info Banner */}
        {selectedPlant && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 mt-4 border-2 rounded-lg border-amber-500 bg-amber-50 dark:bg-amber-900/20"
          >
            <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-200 rounded-lg dark:bg-gray-700">
              <img
                src={getOptimizedImageUrl(selectedPlant.imageUrl, 100)}
                alt={selectedPlant.imageName}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Viewing: {selectedPlant.imageName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatCoordinates(selectedPlant.latitude, selectedPlant.longitude)}
              </p>
            </div>
            <button
              onClick={handleResetView}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-amber-100 dark:text-gray-400 dark:hover:bg-amber-800"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <FilterPanel
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {/* Map container */}
      <div className="relative flex-1">
        {/* Plant List Sidebar */}
        <AnimatePresence>
          {showPlantList && (
            <PlantListSidebar
              plants={filteredPlants}
              selectedPlant={selectedPlant}
              onSelectPlant={handleSelectPlant}
              onClose={() => setShowPlantList(false)}
            />
          )}
        </AnimatePresence>

        {/* Leaflet Map */}
        <MapContainer
          center={MAP_CONFIG.DEFAULT_CENTER}
          zoom={MAP_CONFIG.DEFAULT_ZOOM}
          minZoom={MAP_CONFIG.MIN_ZOOM}
          maxZoom={22}
          className="w-full h-full rounded-lg"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url={tileLayer}
            attribution='Imagery &copy; Google Maps / Esri'
            maxZoom={22}
            maxNativeZoom={22}
          />

          <MapController
            selectedPlant={selectedPlant}
            plants={filteredPlants}
            triggerFitBounds={triggerFitBounds}
          />

          {/* Render markers */}
          {filteredPlants.map((plant) => (
            <Marker
              key={plant.id}
              position={[plant.latitude, plant.longitude]}
              icon={selectedPlant?.id === plant.id ? highlightedPlantIcon : plantIcon}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2">
                  {/* Plant image */}
                  <div className="mb-3 overflow-hidden rounded-lg">
                    <img
                      src={getOptimizedImageUrl(plant.imageUrl, 300)}
                      alt={plant.imageName}
                      className="object-cover w-full h-48"
                    />
                  </div>

                  {/* Plant name */}
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {plant.imageName}
                  </h3>

                  {/* Plant details */}
                  <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {formatCoordinates(plant.latitude, plant.longitude)}
                    </p>
                    <p className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Uploaded {formatDate(plant.uploadedAt)}
                    </p>
                  </div>

                  {/* Zoom button (if not already selected) */}
                  {selectedPlant?.id !== plant.id && (
                    <button
                      onClick={() => handleZoomToPlant(plant)}
                      className="flex items-center justify-center w-full gap-2 px-3 py-2 mb-2 text-sm font-medium text-white transition-colors rounded-lg bg-amber-500 hover:bg-amber-600"
                    >
                      <ZoomIn className="w-4 h-4" />
                      Zoom to This Plant
                    </button>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <a
                      href={plant.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Full
                    </a>
                    <button
                      onClick={() => handleDeletePlant(plant)}
                      disabled={deletingId === plant.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === plant.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Info message */}
          {filteredPlants.length > 50 && (
            <div className="absolute z-[1000] p-4 bg-white rounded-lg shadow-lg bottom-4 left-4 dark:bg-gray-800 max-w-xs">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 Tip: You have {filteredPlants.length} plants. Use the "Show Plant List" button or search to quickly find specific plants!
              </p>
            </div>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default FarmMap;