import { useEffect, useState } from 'react';

export default function useRecaptcha(action: string) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // If grecaptcha is not ready yet, wait until it loads.
    if (!window.grecaptcha) return;

    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(
          import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY,
          { action }
        );
        setToken(token);
      } catch (err) {
        console.error('Failed to execute reCAPTCHA:', err);
      }
    });
  }, [action]);

  return token;
}
