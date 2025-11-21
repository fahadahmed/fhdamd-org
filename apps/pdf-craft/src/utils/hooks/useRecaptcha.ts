import { useEffect, useState, useRef } from 'react';

export default function useRecaptcha(action: string) {
  const [token, setToken] = useState<string | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    // If grecaptcha is not ready yet, wait until it loads.
    if (!window.grecaptcha) return;

    latestRequest.current += 1;
    const requestId = latestRequest.current;

    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(
          import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY,
          { action }
        );
        if (latestRequest.current === requestId) {
          setToken(token);
        }
      } catch (err) {
        if (latestRequest.current === requestId) {
          console.error('Failed to execute reCAPTCHA:', err);
        }
      }
    });
  }, [action]);

  return token;
}
