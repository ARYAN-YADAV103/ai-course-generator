import { useEffect, useState } from 'react';

export function useBackendHealth() {
  const [status, setStatus] = useState({ state: 'checking', detail: 'Checking API' });

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        if (!isMounted) return;
        if (!response.ok) {
          setStatus({ state: 'error', detail: 'API unavailable' });
          return;
        }
        const data = await response.json();
        setStatus({ state: 'connected', detail: data.mode || 'Connected', engine: data.engine });
      } catch {
        if (isMounted) setStatus({ state: 'error', detail: 'API unavailable' });
      }
    };

    checkBackend();
    const interval = window.setInterval(checkBackend, 10000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return status;
}
