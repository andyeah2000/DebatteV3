import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPool } from '@vercel/postgres'

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
})

export async function createContext({ req, res }) {
  const session = await getServerSession(authOptions)

  return {
    session,
    db: pool,
    req,
    res
  }
} 