import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export function useExactRoute(expectedPath: string) {
  const [location] = useLocation();
  const [isExactMatch, setIsExactMatch] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const matches = currentPath === expectedPath;
    setIsExactMatch(matches);
    
    // Force correct route state on mount and path changes
    if (!matches && location === expectedPath) {
      // Route mismatch detected, force browser URL to match
      window.history.replaceState(null, '', expectedPath);
      setIsExactMatch(true);
    }
  }, [location, expectedPath]);

  return isExactMatch;
}