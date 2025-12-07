// lib/performance/webVitals.ts
import { type NextWebVitalsMetric } from 'next/dist/shared/lib/utils';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Log metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  }

  // Send to analytics in production
  if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    // Send to your analytics service
    const url = `/api/analytics/web-vitals`;
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, JSON.stringify(metric));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true,
      }).catch(err => console.error('Failed to report web vitals:', err));
    }
  }
}
