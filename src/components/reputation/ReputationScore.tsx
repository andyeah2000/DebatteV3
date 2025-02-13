'use client'

import { motion } from 'framer-motion'
import { Tooltip } from '@/components/ui/tooltip'

interface ReputationScoreProps {
  total: number
  debate?: number
  comment?: number
  source?: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

export function ReputationScore({
  total,
  debate,
  comment,
  source,
  size = 'md',
  showDetails = false,
  className = ''
}: ReputationScoreProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const containerClasses = `
    inline-flex items-center gap-2
    ${sizeClasses[size]}
    ${className}
  `

  const scoreClasses = `
    font-medium text-primary-600 dark:text-primary-400
    ${sizeClasses[size]}
  `

  const detailClasses = `
    text-secondary-500 dark:text-secondary-400
    ${sizeClasses[size]}
  `

  const tooltipContent = (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-secondary-500 dark:text-secondary-400">Total</span>
        <span className="font-medium">{total}</span>
      </div>
      {debate !== undefined && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary-500 dark:text-secondary-400">Debates</span>
          <span className="font-medium">{debate}</span>
        </div>
      )}
      {comment !== undefined && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary-500 dark:text-secondary-400">Comments</span>
          <span className="font-medium">{comment}</span>
        </div>
      )}
      {source !== undefined && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary-500 dark:text-secondary-400">Sources</span>
          <span className="font-medium">{source}</span>
        </div>
      )}
    </div>
  )

  const content = (
    <div className={containerClasses}>
      <motion.span
        className={scoreClasses}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
      >
        {total}
      </motion.span>
      {showDetails && (
        <>
          {debate !== undefined && (
            <span className={detailClasses}>
              D: {debate}
            </span>
          )}
          {comment !== undefined && (
            <span className={detailClasses}>
              C: {comment}
            </span>
          )}
          {source !== undefined && (
            <span className={detailClasses}>
              S: {source}
            </span>
          )}
        </>
      )}
    </div>
  )

  return showDetails ? content : (
    <Tooltip content={tooltipContent}>
      {content}
    </Tooltip>
  )
} 