import { AnalyticsProps } from '@vercel/analytics/react'

export const analyticsConfig: AnalyticsProps = {
  mode: 'production',
  debug: false,
  beforeSend: (event) => {
    if (event.url) {
      try {
        const url = new URL(event.url)
        if (url.searchParams.has('token')) {
          url.searchParams.delete('token')
          event.url = url.toString()
        }
      } catch (e) {
        console.error('Error processing analytics event URL:', e)
      }
    }
    return event
  }
} 