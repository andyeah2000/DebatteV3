import { authOptions } from '@/lib/auth'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)

// Export the handler as named functions for HTTP methods
export async function GET(req: Request) {
  return handler(req)
}

export async function POST(req: Request) {
  return handler(req)
} 