// Sentry Error Tracking Configuration
// Set VITE_SENTRY_DSN environment variable to enable
// In production, this captures client-side errors for monitoring

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] DSN not configured, error tracking disabled');
    return;
  }
  
  console.log('[Sentry] Error tracking enabled');
  // In production, initialize Sentry SDK here:
  // import * as Sentry from '@sentry/react';
  // Sentry.init({ dsn, tracesSampleRate: 0.1 });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error('[Error]', error.message, context);
  // In production: Sentry.captureException(error, { extra: context });
}
