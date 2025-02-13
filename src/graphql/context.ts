import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPool } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
})

interface GraphQLContext {
  session: any
  db: any
  req: NextRequest
  res: NextResponse
}

interface ContextParams {
  req: NextRequest
  res: NextResponse
}

export async function createContext({ req, res }: ContextParams): Promise<GraphQLContext> {
  const session = await getServerSession(authOptions)

  return {
    session,
    db: pool,
    req,
    res
  }
} 