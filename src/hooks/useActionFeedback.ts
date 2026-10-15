import { useCallback, useEffect, useRef, useState } from 'react';

export function useActionFeedback() {
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  const announce = useCallback((message: string, success = true) => {
    if (!mounted.current) return;
    if (timeout.current) clearTimeout(timeout.current);
    setFeedback({ message, success });
    // Errors remain available so the visitor can follow the manual alternative.
    if (success) timeout.current = setTimeout(() => setFeedback(null), 6000);
  }, []);
  return { feedback, announce };
}
