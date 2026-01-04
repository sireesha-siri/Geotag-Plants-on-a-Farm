// Import React hooks and lazy loading
import React, { useEffect, Suspense, lazy } from 'react';
// Import React Router components for navigation
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Import Redux Provider for state management
import { Provider } from 'react-redux';
// Import Framer Motion for route transitions
import { AnimatePresence } from 'framer-motion';
// Import Redux store and hooks
import { store, useAppDispatch, useAppSelector } from './redux/store';
// Import Redux actions for theme and plants
import { setTheme } from './redux/slices/themeSlice';
import { fetchPlantsStart, fetchPlantsSuccess, fetchPlantsFailure } from './redux/slices/plantsSlice';
// Import common components
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
// Import utilities and services
import { loadPlantsFromLocal } from './utils/storage';
import { fetchUserPlants } from './services/api';

// OPTIMIZATION: Eager load PlantList to eliminate lazy loading delay
import PlantList from './components/plants/PlantList';

// Lazy load less frequently used components
const ImageUpload = lazy(() => import('./components/upload/ImageUpload'));
const FarmMap = lazy(() => import('./components/map/FarmMap'));

/**
 * NotFound component - 404 page displayed when route doesn't match
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">404</h1>
    <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">Page not found</p>
    <a href="/" className="btn-primary">Go Home</a>
  </div>
);

/**
 * AppRoutes component - Defines all application routes with animations
 * Uses AnimatePresence for smooth page transitions
 */
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Redirect root to upload page */}
        <Route path="/" element={<Navigate to="/upload" replace />} />
        {/* Main application routes */}
        <Route path="/upload" element={
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
            <ImageUpload />
          </Suspense>
        } />
        <Route path="/farm" element={
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading map..." />}>
            <FarmMap />
          </Suspense>
        } />
        {/* PlantList is NOT lazy loaded - renders immediately */}
        <Route path="/plants" element={<PlantList />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

/**
 * AppContent component - Main application content with hooks and initialization
 * Handles theme setup and initial data loading
 */
const AppContent = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    // 1. Set theme immediately
    dispatch(setTheme(theme));

    // 2. Load from localStorage IMMEDIATELY (no API wait)
    const localPlants = loadPlantsFromLocal();
    if (localPlants && localPlants.length > 0) {
      dispatch(fetchPlantsSuccess(localPlants));
    } else {
      // If no local data, set empty array immediately
      dispatch(fetchPlantsSuccess([]));
    }
    
    // 3. Then fetch from API in background to sync data
    const loadFromAPI = async () => {
      try {
        dispatch(fetchPlantsStart());
        const apiResult = await fetchUserPlants();
        if (apiResult.success && apiResult.data.length > 0) {
          // Update with fresh data from API
          dispatch(fetchPlantsSuccess(apiResult.data));
        } else {
          // API returned empty or failed, keep using localStorage
          dispatch(fetchPlantsSuccess(localPlants || []));
        }
      } catch (error) {
        console.log('API fetch failed, using localStorage data');
        dispatch(fetchPlantsFailure('API unavailable'));
      }
    };
    
    // Sync with API in background (doesn't block UI)
    loadFromAPI();
    
  }, [dispatch, theme]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" text="Loading application..." />
        </div>
      }
    >
      <Layout>
        <AppRoutes />
      </Layout>
    </Suspense>
  );
};

/**
 * Main App component - Root component that sets up the application
 * Provides Redux store, error boundary, and routing context
 */
function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

// Export App component as default
export default App;