import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
      // Automatically retry queries when coming back online
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also listen for focus events to check connectivity
    const handleFocus = () => {
      if (!navigator.onLine && isOnline) {
        setIsOnline(false);
        setShowAlert(true);
      } else if (navigator.onLine && !isOnline) {
        setIsOnline(true);
        setShowAlert(false);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isOnline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Test connectivity with a simple request
      const response = await fetch('/api/user', { 
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setIsOnline(true);
        setShowAlert(false);
        queryClient.refetchQueries();
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      setIsOnline(false);
      setShowAlert(true);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!showAlert && isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription className="flex-1">
            {isOnline 
              ? "Connection restored" 
              : "Network connection lost. Some features may not work properly."
            }
          </AlertDescription>
          {!isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                "Retry"
              )}
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}