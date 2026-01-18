import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getVisitorId = (): string => {
  const key = 'visitor_id';
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = getVisitorId();
        
        await supabase.functions.invoke('page-analytics', {
          body: {
            action: 'track',
            page_path: location.pathname,
            visitor_id: visitorId,
          },
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience for analytics
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
