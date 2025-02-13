import { createPool } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
})

interface Context {
  session: any
  db: any
  req: Request
  res: Response
}

interface QueryArgs {
  id?: string
  skip?: number
  take?: number
  orderBy?: string
  searchTerm?: string
  tags?: string[]
}

interface CreateDebateInput {
  title: string
  description: string
  category: string
  tags: string[]
}

interface CreateCommentInput {
  content: string
  debateId: string
  isProArgument: boolean
  sources?: string[]
}

interface CreateVoteInput {
  debateId: string
  isProVote: boolean
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) return null
      
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [session.user.email]
      )
      return rows[0]
    },

    debate: async (_: unknown, { id }: QueryArgs) => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE id = $1',
        [id]
      )
      const debate = rows[0]
      if (!debate) return null

      // Add computed fields
      debate.qualityScore = calculateQualityScore(debate)
      debate.sourceQualityScore = calculateSourceQualityScore(debate)
      debate.currentPhase = calculateCurrentPhase(debate)
      
      return debate
    },

    debates: async (_: unknown, { skip = 0, take = 10, orderBy = 'createdAt', searchTerm, tags }: QueryArgs) => {
      let query = 'SELECT * FROM debates'
      const params = []
      
      if (searchTerm) {
        query += ' WHERE title ILIKE $1 OR description ILIKE $1'
        params.push(`%${searchTerm}%`)
      }
      
      if (tags && tags.length > 0) {
        const tagCondition = tags.map((_: string, i: number) => `$${params.length + i + 1} = ANY(tags)`).join(' OR ')
        query += params.length ? ' AND' : ' WHERE'
        query += ` (${tagCondition})`
        params.push(...tags)
      }
      
      query += ` ORDER BY ${orderBy} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(take, skip)
      
      const { rows } = await pool.query(query, params)
      return rows.map(debate => ({
        ...debate,
        qualityScore: calculateQualityScore(debate),
        sourceQualityScore: calculateSourceQualityScore(debate),
        currentPhase: calculateCurrentPhase(debate)
      }))
    },

    featuredDebates: async () => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE is_featured = true ORDER BY created_at DESC LIMIT 5'
      )
      return rows.map(debate => ({
        ...debate,
        qualityScore: calculateQualityScore(debate),
        sourceQualityScore: calculateSourceQualityScore(debate),
        currentPhase: calculateCurrentPhase(debate)
      }))
    },

    trendingTopics: async () => {
      const { rows } = await pool.query(`
        SELECT UNNEST(tags) as tag, COUNT(*) as count
        FROM debates
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
      `)
      return rows.map(row => row.tag)
    }
  },

  Mutation: {
    createDebate: async (_: unknown, { input }: { input: CreateDebateInput }, context: Context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error('Not authenticated')

      const { rows } = await pool.query(
        'INSERT INTO debates (title, description, category, tags, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [input.title, input.description, input.category, input.tags, session.user.id]
      )
      return rows[0]
    },

    createComment: async (_: unknown, { input }: { input: CreateCommentInput }, context: Context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error('Not authenticated')

      const { rows } = await pool.query(
        'INSERT INTO comments (content, debate_id, author_id, is_pro_argument, sources) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [input.content, input.debateId, session.user.id, input.isProArgument, input.sources || []]
      )
      return rows[0]
    },

    createVote: async (_: unknown, { input }: { input: CreateVoteInput }, context: Context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error('Not authenticated')

      const { rows } = await pool.query(
        'INSERT INTO votes (debate_id, user_id, is_pro_vote) VALUES ($1, $2, $3) RETURNING *',
        [input.debateId, session.user.id, input.isProVote]
      )
      return rows[0]
    }
  },

  Debate: {
    author: async (debate: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [debate.author_id]
      )
      return rows[0]
    },

    comments: async (debate: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM comments WHERE debate_id = $1 ORDER BY created_at DESC',
        [debate.id]
      )
      return rows
    },

    timeline: async (debate: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM timeline_events WHERE debate_id = $1 ORDER BY timestamp ASC',
        [debate.id]
      )
      return rows
    },

    phases: async (debate: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM debate_phases WHERE debate_id = $1 ORDER BY start_time ASC',
        [debate.id]
      )
      return rows
    },

    voteStatistics: async (debate: any) => {
      const { rows } = await pool.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN is_pro_vote THEN 1 ELSE 0 END) as pro FROM votes WHERE debate_id = $1',
        [debate.id]
      )
      
      const total = parseInt(rows[0].total)
      const pro = parseInt(rows[0].pro)
      const con = total - pro
      
      return {
        totalVotes: total,
        proVotes: pro,
        conVotes: con,
        proPercentage: total > 0 ? (pro / total) * 100 : 0,
        conPercentage: total > 0 ? (con / total) * 100 : 0
      }
    },

    metadata: async (debate: any) => {
      // Implement AI analysis and metadata computation
      return {
        aiAnalysis: {
          argumentQuality: 85,
          biasLevel: 20,
          factualAccuracy: 90,
          moderationConfidence: 95
        },
        argumentStrengths: ['Well-researched', 'Balanced perspective'],
        argumentWeaknesses: ['Could use more sources'],
        biasTypes: [],
        suggestions: ['Consider adding more expert opinions']
      }
    }
  },

  Comment: {
    author: async (comment: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [comment.author_id]
      )
      return rows[0]
    },

    debate: async (comment: any) => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE id = $1',
        [comment.debate_id]
      )
      return rows[0]
    }
  }
}

// Helper functions for computed fields
function calculateQualityScore(debate: any): number {
  // Implement quality score calculation logic
  return 85
}

function calculateSourceQualityScore(debate: any): number {
  // Implement source quality score calculation logic
  return 90
}

function calculateCurrentPhase(debate: any): string {
  // Implement current phase calculation logic
  return 'DISCUSSION'
} 