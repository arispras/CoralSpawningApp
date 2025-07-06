import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay: number | null) => {
  // Provide null as initial value and specify the type
  const savedCallback = useRef<() => void>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};