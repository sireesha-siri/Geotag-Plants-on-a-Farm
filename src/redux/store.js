// Import configureStore from Redux Toolkit for store setup
import { configureStore } from '@reduxjs/toolkit';
// Import React-Redux hooks for typed usage
import { useDispatch, useSelector } from 'react-redux';
// Import reducers for plants and theme slices
import plantsReducer from './slices/plantsSlice';
import themeReducer from './slices/themeSlice';

/**
 * Configure and create the Redux store
 * Combines reducers and applies middleware configuration
 */
export const store = configureStore({
  // Combine reducers into a single root reducer
  reducer: {
    plants: plantsReducer, // Manages plants state
    theme: themeReducer,   // Manages theme state
  },
  // Configure middleware, disabling serializable state invariant check
  // This allows non-serializable values like functions in state
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // Enable Redux DevTools only in development environment
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Typed useDispatch hook for dispatching actions
 * Provides type safety for dispatched actions
 * @returns {Function} Dispatch function with type annotations
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed useSelector hook for selecting state
 * Provides type safety for state selection
 * @param {Function} selector - Selector function
 * @returns {*} Selected state value
 */
export const useAppSelector = useSelector;