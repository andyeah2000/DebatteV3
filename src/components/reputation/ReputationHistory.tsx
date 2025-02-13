'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface ReputationEvent {
  id: string
  action: string
  points: number
  timestamp: string
  context?: {
    debateId?: string
    debateTitle?: string
    commentId?: string
    commentContent?: string
  }
}

interface ReputationHistoryProps {
  events: ReputationEvent[]
  limit?: number
  className?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'create_debate':
      return 'Created a debate'
    case 'receive_upvote':
      return 'Received an upvote'
    case 'receive_downvote':
      return 'Received a downvote'
    case 'comment_upvoted':
      return 'Comment was upvoted'
    case 'comment_downvoted':
      return 'Comment was downvoted'
    case 'source_verified':
      return 'Source was verified'
    case 'debate_won':
      return 'Won a debate'
    case 'quality_contribution':
      return 'Quality contribution'
    default:
      return action
  }
}

export function ReputationHistory({
  events,
  limit,
  className = ''
}: ReputationHistoryProps) {
  const displayEvents = limit ? events.slice(0, limit) : events

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
      <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
        Reputation History
      </h3>

      <div className="space-y-3">
        {displayEvents.map((event) => (
          <motion.div
            key={event.id}
            variants={item}
            className="flex items-start justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-700"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-secondary-900 dark:text-white">
                  {getActionLabel(event.action)}
                </span>
                <span className={`text-sm ${
                  event.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {event.points > 0 ? '+' : ''}{event.points}
                </span>
              </div>
              {event.context && (
                <div className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                  {event.context.debateTitle && (
                    <span>in debate "{event.context.debateTitle}"</span>
                  )}
                  {event.context.commentContent && (
                    <span>on comment "{event.context.commentContent.slice(0, 50)}..."</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-secondary-400 dark:text-secondary-500">
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </div>
          </motion.div>
        ))}
      </div>

      {limit && events.length > limit && (
        <div className="mt-4 text-center">
          <button
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            onClick={() => {/* TODO: Implement view more logic */}}
          >
            View More History
          </button>
        </div>
      )}
    </motion.div>
  )
} 