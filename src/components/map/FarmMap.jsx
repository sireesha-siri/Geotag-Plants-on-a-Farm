import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Trash2, Image as ImageIcon, MapPin } from 'lucide-react';
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

// IMPORTANT: Import MarkerClusterGroup differently
import 'react-leaflet-markercluster/dist/styles.min.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom plant marker icon
const plantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMTZhMzRhIiBzdHJva2U9IiMxNmEzNGEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNyAyMGgxMCIvPjxwYXRoIGQ9Ik0xMCAyMGMxLjUtMi41IDEuNS02IDEuNS0xMEMxMS41IDYgMTAgNSA5LjUgNHMtMS41IDItMS41IDZ2MTBjMCAxIC41IDIgMiAyeiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

/**
 * FitBounds component - Automatically fit map to show all plants
 */
const FitBounds = ({ plants }) => {
  const map = useMap();

  useEffect(() => {
    if (plants && plants.length > 0) {
      try {
        const bounds = getBounds(plants);
        if (bounds && bounds[0] && bounds[1]) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [plants, map]);

  return null;
};

/**
 * FarmMap component - Main map view
 * WITHOUT MarkerClusterGroup to avoid context issues
 */
const FarmMap = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const allPlants = useAppSelector((state) => state.plants.plants);
  const filters = useAppSelector((state) => state.plants.filters);
  const loading = useAppSelector((state) => state.plants.loading);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Filter plants
  const filteredPlants = allPlants.filter(plant =>
    !filters.searchTerm ||
    plant.imageName.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

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
    } catch (error) {
      toast.error('Failed to delete plant');
    } finally {
      setDeletingId(null);
    }
  };

  // Select tile layer based on theme
  const tileLayer = theme === 'dark' ? TILE_LAYERS.dark : TILE_LAYERS.light;

  // Show loading state
  if (loading && allPlants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" text="Loading farm map..." />
      </div>
    );
  }

  // Show empty state if no plants
  if (allPlants.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No plants on the map yet"
        description="Upload your first plant image to see it appear on the map"
        actionLabel="Upload Plants"
        onAction={() => window.location.href = '/upload'}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Farm Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''} on your farm
          </p>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Filters {isFilterOpen ? '▼' : '▶'}
        </button>
      </motion.div>

      {/* Filter panel */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <FilterPanel onClose={() => setIsFilterOpen(false)} />
        </motion.div>
      )}

      {/* Map container - WITHOUT MarkerClusterGroup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden shadow-2xl rounded-xl"
        style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
      >
        <MapContainer
          center={MAP_CONFIG.DEFAULT_CENTER}
          zoom={MAP_CONFIG.DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileLayer}
          />

          <FitBounds plants={filteredPlants} />

          {/* Render markers directly without clustering */}
          {filteredPlants.map((plant) => (
            <Marker
              key={plant.id}
              position={[plant.latitude, plant.longitude]}
              icon={plantIcon}
            >
              <Popup className="custom-popup" minWidth={250}>
                <div className="p-2">
                  {/* Plant image */}
                  <div className="mb-3 overflow-hidden rounded-lg">
                    <img
                      src={getOptimizedImageUrl(plant.imageUrl, 300)}
                      alt={plant.imageName}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                  </div>

                  {/* Plant name */}
                  <h3 className="mb-2 font-semibold text-gray-900 truncate">
                    {plant.imageName}
                  </h3>

                  {/* Plant details */}
                  <div className="mb-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{formatCoordinates(plant.latitude, plant.longitude)}</span>
                    </div>
                    <div>
                      <span className="text-xs">
                        Uploaded {formatDate(plant.uploadedAt)}
                      </span>
                    </div>
                  </div>

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
        </MapContainer>
      </motion.div>

      {/* Info message if many plants */}
      {filteredPlants.length > 50 && (
        <div className="p-4 mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Tip: You have {filteredPlants.length} plants. Use filters to reduce the number of markers for better performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmMap;