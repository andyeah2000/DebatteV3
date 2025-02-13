import { createPool, Pool } from '@vercel/postgres'

let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    pool = createPool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const client = await getPool().connect()
  try {
    return await client.query(text, params)
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
} 