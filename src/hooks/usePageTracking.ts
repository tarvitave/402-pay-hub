import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const getVisitorId = (): string => {
  const key = 'visitor_id';
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
};

export const trackAction = async (action: string, label?: string, metadata?: Record<string, unknown>) => {
  try {
    await supabase.functions.invoke('page-analytics', {
      body: {
        action: 'log-action',
        visitor_id: getVisitorId(),
        page_path: window.location.pathname,
        user_action: action,
        label,
        metadata,
      },
    });
  } catch {
    // analytics must never break the app
  }
};

// Noise injected by third-party webviews (Outlook/Office link scanners, some
// extensions) rather than real application errors. Never log these.
const IGNORED_ERROR_PATTERNS = [
  /Object Not Found Matching Id/i,
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /^Script error\.?$/i,
];

const isIgnorableError = (message: string) =>
  IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(message));

export const trackError = async (message: string, stack?: string, errorType = 'error') => {
  if (!message || isIgnorableError(message)) return;
  try {
    await supabase.functions.invoke('page-analytics', {
      body: {
        action: 'log-error',
        visitor_id: getVisitorId(),
        page_path: window.location.pathname,
        message,
        stack,
        error_type: errorType,
        user_agent: navigator.userAgent,
      },
    });
  } catch {
    // ignore
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    let viewId: string | null = null;
    let sent = false;
    const startedAt = Date.now();

    const trackPageView = async () => {
      try {
        const visitorId = getVisitorId();

        const { data } = await supabase.functions.invoke('page-analytics', {
          body: {
            action: 'track',
            page_path: location.pathname,
            visitor_id: visitorId,
            referrer: document.referrer || null,
          },
        });
        viewId = (data as { id?: string } | null)?.id ?? null;
      } catch (error) {
        // Silently fail - don't interrupt user experience for analytics
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();

    const sendDuration = () => {
      if (sent || !viewId) return;
      sent = true;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      supabase.functions
        .invoke('page-analytics', {
          body: { action: 'duration', view_id: viewId, duration_seconds: seconds },
        })
        .catch(() => undefined);
    };

    const onHidden = () => {
      if (document.visibilityState === 'hidden') sendDuration();
    };

    document.addEventListener('visibilitychange', onHidden);

    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      sendDuration();
    };
  }, [location.pathname]);
};

export const useErrorTracking = () => {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      trackError(e.message, e.error?.stack, 'js-error');
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      trackError(
        reason instanceof Error ? reason.message : String(reason),
        reason instanceof Error ? reason.stack : undefined,
        'unhandled-rejection'
      );
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
};
