import { createPool } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
})

export const resolvers = {
  Query: {
    me: async (_, __, context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) return null
      
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [session.user.email]
      )
      return rows[0]
    },

    debate: async (_, { id }) => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE id = $1',
        [id]
      )
      return rows[0]
    },

    debates: async (_, { skip = 0, take = 10, orderBy = 'createdAt', searchTerm, tags }) => {
      let query = 'SELECT * FROM debates'
      const params = []
      
      if (searchTerm) {
        query += ' WHERE title ILIKE $1 OR description ILIKE $1'
        params.push(`%${searchTerm}%`)
      }
      
      if (tags && tags.length > 0) {
        const tagCondition = tags.map((_, i) => `$${params.length + i + 1} = ANY(tags)`).join(' OR ')
        query += params.length ? ' AND' : ' WHERE'
        query += ` (${tagCondition})`
        params.push(...tags)
      }
      
      query += ` ORDER BY ${orderBy} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(take, skip)
      
      const { rows } = await pool.query(query, params)
      return rows
    },

    featuredDebates: async () => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE is_featured = true ORDER BY created_at DESC LIMIT 5'
      )
      return rows
    }
  },

  Mutation: {
    createDebate: async (_, { input }, context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error('Not authenticated')

      const { rows } = await pool.query(
        'INSERT INTO debates (title, description, tags, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [input.title, input.description, input.tags, session.user.id]
      )
      return rows[0]
    },

    createComment: async (_, { input }, context) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error('Not authenticated')

      const { rows } = await pool.query(
        'INSERT INTO comments (content, debate_id, author_id, is_pro_argument, sources) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [input.content, input.debateId, session.user.id, input.isProArgument, input.sources || []]
      )
      return rows[0]
    },

    createVote: async (_, { input }, context) => {
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
    author: async (debate) => {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [debate.author_id]
      )
      return rows[0]
    },

    comments: async (debate) => {
      const { rows } = await pool.query(
        'SELECT * FROM comments WHERE debate_id = $1 ORDER BY created_at DESC',
        [debate.id]
      )
      return rows
    },

    voteStatistics: async (debate) => {
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
    }
  },

  Comment: {
    author: async (comment) => {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [comment.author_id]
      )
      return rows[0]
    },

    debate: async (comment) => {
      const { rows } = await pool.query(
        'SELECT * FROM debates WHERE id = $1',
        [comment.debate_id]
      )
      return rows[0]
    }
  }
} 