import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create div element if it doesn't exist
    if (!portalRef.current) {
      const div = document.createElement('div');
      portalRef.current = div;
    }

    // Append to document body
    document.body.appendChild(portalRef.current);
    setMounted(true);

    // Clean up
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, []);

  if (!mounted || !portalRef.current) return null;

  return createPortal(children, portalRef.current);
}