import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPool } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
    db: getPool(),
    req,
    res
  }
} 