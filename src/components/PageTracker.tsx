import { usePageTracking, useErrorTracking } from '@/hooks/usePageTracking';

export const PageTracker = () => {
  usePageTracking();
  useErrorTracking();
  return null;
};
