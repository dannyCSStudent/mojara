import { useEffect, useRef } from "react";

export function usePolling(
  fn: () => void,
  interval = 5000,
  enabled = true
) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return;
    }

    fn(); // run immediately
    timer.current = setInterval(fn, interval);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [fn, interval, enabled]);
}
