'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReputationScore } from './ReputationScore'

interface LeaderboardEntry {
  user: {
    id: string
    username: string
    avatarUrl?: string
  }
  rank: number
  score: number
  debateScore?: number
  commentScore?: number
  sourceScore?: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  category?: 'overall' | 'debate' | 'comment' | 'source'
  showDetails?: boolean
  limit?: number
  className?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Leaderboard({
  entries,
  category = 'overall',
  showDetails = false,
  limit = 10,
  className = ''
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, limit)

  const containerClasses = `
    rounded-lg bg-white p-4 shadow-sm dark:bg-secondary-800
    ${className}
  `

  return (
    <motion.div
      className={containerClasses}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
          {category === 'overall' ? 'Top Contributors' :
           category === 'debate' ? 'Top Debaters' :
           category === 'comment' ? 'Top Commenters' :
           'Top Source Providers'}
        </h3>
        {showDetails && (
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            {category === 'overall' ? 'Total Points' :
             category === 'debate' ? 'Debate Points' :
             category === 'comment' ? 'Comment Points' :
             'Source Points'}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {displayEntries.map((entry) => (
          <motion.div
            key={entry.user.id}
            variants={item}
            className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
              {entry.rank}
            </div>
            <Link
              href={`/users/${entry.user.id}`}
              className="flex flex-1 items-center gap-3"
            >
              <img
                src={entry.user.avatarUrl || `https://ui-avatars.com/api/?name=${entry.user.username}`}
                alt={entry.user.username}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-medium text-secondary-900 dark:text-white">
                {entry.user.username}
              </span>
            </Link>
            <ReputationScore
              total={entry.score}
              debate={entry.debateScore}
              comment={entry.commentScore}
              source={entry.sourceScore}
              showDetails={showDetails}
              size="sm"
            />
          </motion.div>
        ))}
      </div>

      {entries.length > limit && (
        <div className="mt-4 text-center">
          <Link
            href="/leaderboard"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View Full Leaderboard
          </Link>
        </div>
      )}
    </motion.div>
  )
} 