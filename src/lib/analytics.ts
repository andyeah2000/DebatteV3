import { Analytics } from '@segment/analytics-next';
import mixpanel from 'mixpanel-browser';
import { datadogRum } from '@datadog/browser-rum';
import * as Sentry from '@sentry/nextjs';

// Initialize Segment
const segmentAnalytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '',
});

// Initialize Mixpanel
mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '');

// Initialize Datadog RUM
datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID || '',
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
  site: 'datadoghq.com',
  service: 'debattle',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const analytics = {
  // Track page views
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    segmentAnalytics.page(pageName, properties);
    mixpanel.track('Page View', { page: pageName, ...properties });
    datadogRum.addTiming('page_view', { name: pageName });
  },

  // Track user actions
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    segmentAnalytics.track(eventName, properties);
    mixpanel.track(eventName, properties);
    datadogRum.addAction(eventName, { ...properties });
  },

  // Identify users
  identifyUser: (userId: string, traits?: Record<string, any>) => {
    segmentAnalytics.identify(userId, traits);
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
    datadogRum.setUser({
      id: userId,
      ...traits,
    });
    Sentry.setUser({
      id: userId,
      ...traits,
    });
  },

  // Track errors
  trackError: (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, { extra: context });
    datadogRum.addError(error, { ...context });
    segmentAnalytics.track('Error Occurred', {
      error: error.message,
      ...context,
    });
  },

  // Track debate engagement
  trackDebateEngagement: (debateId: string, action: string, details?: Record<string, any>) => {
    const properties = {
      debateId,
      action,
      ...details,
    };
    segmentAnalytics.track('Debate Engagement', properties);
    mixpanel.track('Debate Engagement', properties);
    datadogRum.addAction('debate_engagement', properties);
  },

  // Track user performance
  trackUserPerformance: (userId: string, metrics: Record<string, number>) => {
    const properties = {
      userId,
      ...metrics,
    };
    segmentAnalytics.track('User Performance', properties);
    mixpanel.track('User Performance', properties);
    mixpanel.people.increment(metrics);
  },
}; 