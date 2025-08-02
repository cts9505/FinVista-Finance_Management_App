// context/LoadingContext.js
import { createContext, useState, useContext, useMemo } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  // useMemo helps prevent re-rendering issues
  const value = useMemo(() => ({ isLoading, setIsLoading }), [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Custom hook to easily use the context
export function useLoading() {
  return useContext(LoadingContext);
}