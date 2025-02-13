import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const headersList = headers()
    
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

    const response = await fetch(process.env.API_URL || 'http://localhost:4000/graphql', {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Set CORS headers
    const responseHeaders = new Headers()
    responseHeaders.set('Access-Control-Allow-Credentials', 'true')
    responseHeaders.set('Content-Type', 'application/json')
    const origin = req.headers.get('origin')
    if (origin) {
      responseHeaders.set('Access-Control-Allow-Origin', origin)
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    
    const errorHeaders = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': 'true'
    })

    const origin = req.headers.get('origin')
    if (origin) {
      errorHeaders.set('Access-Control-Allow-Origin', origin)
    }

    return new NextResponse(JSON.stringify({ 
      errors: [{ 
        message: error instanceof Error ? error.message : 'Failed to connect to backend service'
      }] 
    }), { 
      status: 500,
      headers: errorHeaders
    })
  }
}

export async function OPTIONS(req: NextRequest) {
  const responseHeaders = new Headers({
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  })

  return new NextResponse(null, {
    status: 200,
    headers: responseHeaders
  })
} 