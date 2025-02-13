import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PortManager } from '@/config/ports'

// Get the backend port from the PortManager
const portManager = PortManager.getInstance()
const BACKEND_URL = `http://127.0.0.1:${portManager.getBackendPort()}/graphql`

async function retryWithBackoff(
  fn: () => Promise<Response>,
  maxRetries: number = 5,
  initialDelay: number = 300,
): Promise<Response> {
  let retries = 0
  let delay = initialDelay

  while (retries < maxRetries) {
    try {
      const response = await fn()
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response
    } catch (error) {
      retries++
      console.log(`Retry attempt ${retries} of ${maxRetries}...`)
      if (retries === maxRetries) throw error

      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2
    }
  }

  throw new Error('Max retries reached')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const headersList = headers()
    
    // Debug logging for incoming request
    console.log('Incoming request to proxy:', {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      body
    })
    
    // Forward headers from the client request
    const forwardHeaders = new Headers()
    headersList.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && 
          key.toLowerCase() !== 'content-length' && 
          key.toLowerCase() !== 'accept-encoding') {
        forwardHeaders.set(key, value)
      }
    })

    // Ensure content type is set
    forwardHeaders.set('content-type', 'application/json')
    forwardHeaders.set('accept-encoding', 'identity')

    // Debug logging for forwarded headers
    console.log('Forwarding request to backend with headers:', 
      Object.fromEntries(forwardHeaders.entries())
    )

    const response = await retryWithBackoff(async () => {
      console.log('Attempting to connect to backend at:', BACKEND_URL)
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify(body),
        credentials: 'include',
      })

      // Log the response status and headers
      console.log('Backend response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      })

      // Clone the response to read it twice
      const resClone = res.clone()
      const responseText = await resClone.text()
      console.log('Backend response body:', responseText)

      if (!res.ok) {
        console.error('Backend response not OK:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: responseText
        })
        throw new Error(`GraphQL request failed with status ${res.status}`)
      }

      return res
    })

    const responseData = await response.json()

    // Create response headers without content-length initially
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && 
          key.toLowerCase() !== 'content-length') {
        responseHeaders.set(key, value)
      }
    })

    // Set CORS headers
    responseHeaders.set('Access-Control-Allow-Credentials', 'true')
    responseHeaders.set('Content-Type', 'application/json')
    const origin = req.headers.get('origin')
    if (origin) {
      responseHeaders.set('Access-Control-Allow-Origin', origin)
    }

    // Ensure no compression/encoding headers are present
    responseHeaders.delete('content-encoding')
    responseHeaders.set('content-encoding', 'identity')
    responseHeaders.set('transfer-encoding', 'identity')

    // Convert response data to JSON string
    const jsonResponse = JSON.stringify(responseData)

    // Debug logging for final response
    console.log('Sending response to client:', {
      status: response.status,
      headers: Object.fromEntries(responseHeaders.entries()),
      dataLength: jsonResponse.length,
      data: responseData
    })

    return new NextResponse(jsonResponse, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    
    const errorHeaders = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Encoding': 'identity',
      'Transfer-Encoding': 'identity'
    })

    const origin = req.headers.get('origin')
    if (origin) {
      errorHeaders.set('Access-Control-Allow-Origin', origin)
    }

    const errorResponse = JSON.stringify({ 
      errors: [{ 
        message: error instanceof Error ? error.message : 'Failed to connect to backend service',
        details: error instanceof Error ? error.stack : 'Unknown error'
      }] 
    })

    return new NextResponse(errorResponse, { 
      status: 503,
      headers: errorHeaders
    })
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Accept-Encoding',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
} 