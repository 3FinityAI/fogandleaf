import { useState, useCallback, useEffect } from "react";

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    // console.error("Async error handled:", error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, clearError };
};
