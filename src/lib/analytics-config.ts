'use server'

import { AnalyticsProps, BeforeSendEvent } from '@vercel/analytics/react'

// Client-side URL sanitization
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    if (urlObj.searchParams.has('token')) {
      urlObj.searchParams.delete('token')
      return urlObj.toString()
    }
    return url
  } catch (e) {
    console.error('Error sanitizing URL:', e)
    return url
  }
}

// Client-safe event processor
function processAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!event) return null
  
  return {
    ...event,
    url: event.url ? sanitizeUrl(event.url) : event.url
  }
}

export const analyticsConfig: AnalyticsProps = {
  mode: 'production',
  debug: false,
  beforeSend: processAnalyticsEvent
} 