import { useCallback, useRef } from 'react';

/**
 * reCAPTCHA v3 tokens are single-use and expire after ~2 minutes, so they
 * can't be generated once on mount and reused across submit attempts —
 * doing so causes intermittent "Captcha verification failed" errors.
 * `getToken` executes reCAPTCHA fresh each time it's called.
 */
export default function useRecaptcha(action: string) {
  const actionRef = useRef(action);
  actionRef.current = action;

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!window.grecaptcha) return null;

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY,
            { action: actionRef.current }
          );
          resolve(token);
        } catch (err) {
          console.error('Failed to execute reCAPTCHA:', err);
          resolve(null);
        }
      });
    });
  }, []);

  return { getToken };
}
