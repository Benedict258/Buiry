// PostHog Analytics Configuration
// Set VITE_POSTHOG_KEY environment variable to enable
// Tracks: page views, feature usage, session events

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) {
    console.log('[PostHog] Key not configured, analytics disabled');
    return;
  }
  
  console.log('[PostHog] Analytics enabled');
  // In production, initialize PostHog here:
  // posthog.init(key, { api_host: 'https://us.i.posthog.com' });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  console.log('[Analytics]', event, properties);
  // In production: posthog.capture(event, properties);
}
