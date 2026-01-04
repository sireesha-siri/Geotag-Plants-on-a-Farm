// Import React and Component for class-based error boundary
import React, { Component } from 'react';
// Import icons from Lucide React
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary component - Catches JavaScript errors in component tree
 * Displays fallback UI when errors occur, preventing app crashes
 */
class ErrorBoundary extends Component {
  /**
   * Constructor - Initialize component state
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    // Initialize state to track error status
    this.state = { hasError: false, error: null };
  }

  /**
   * Static method called when an error is thrown by a descendant component
   * Updates state to trigger error UI rendering
   * @param {Error} error - The error that was thrown
   * @returns {Object} Updated state object
   */
  static getDerivedStateFromError(error) {
    // Return new state indicating an error occurred
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant
   * Logs error details for debugging
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  /**
   * Handle reload button click
   * Refreshes the entire page to reset application state
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Handle go home button click
   * Navigates to home page by changing window location
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Render method - Conditionally render error UI or children
   * @returns {JSX.Element} Error UI or child components
   */
  render() {
    // If an error occurred, render error fallback UI
    if (this.state.hasError) {
      return (
        // Full-screen error display with centered content
        <div className="flex items-center justify-center min-h-screen p-4 bg-bgLight dark:bg-bgDark">
          {/* Error card container */}
          <div className="w-full max-w-md p-8 text-center bg-white shadow-lg dark:bg-gray-800 rounded-xl">
            {/* Error icon and message section */}
            <div className="mb-6">
              {/* Warning triangle icon */}
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              {/* Error title */}
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Oops! Something went wrong
              </h1>
              {/* Error description */}
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {/* Action buttons section */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {/* Reload page button */}
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              {/* Go home button */}
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 text-gray-900 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Export ErrorBoundary as default
export default ErrorBoundary;
