// Import React hooks for state and side effects
import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a CSS media query matches
 * @param {string} query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} Whether the media query currently matches
 */
export function useMediaQuery(query) {
  // State to track if the media query matches
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create MediaQueryList object for the query
    const media = window.matchMedia(query);
    // Set initial match state
    setMatches(media.matches);

    // Define listener to update state on media query changes
    const listener = () => setMatches(media.matches);
    // Add event listener for changes
    media.addEventListener('change', listener);

    // Cleanup: remove event listener on unmount or query change
    return () => media.removeEventListener('change', listener);
  }, [query]); // Re-run effect if query changes

  // Return current match state
  return matches;
}

/**
 * Hook to check if device is mobile (max width 768px)
 * @returns {boolean} True if screen width is 768px or less
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');

/**
 * Hook to check if device is tablet (min 768px, max 1024px)
 * @returns {boolean} True if screen width is between 768px and 1024px
 */
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

/**
 * Hook to check if device is desktop (min 1024px)
 * @returns {boolean} True if screen width is 1024px or more
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
