'use client'

import { motion } from 'framer-motion'
import { Tooltip } from '@/components/ui/tooltip'

interface BadgeProps {
  name: string
  description: string
  icon: string
  category: string
  isLocked?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  name,
  description,
  icon,
  category,
  isLocked = false,
  size = 'md',
  className = ''
}: BadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  }

  const containerClasses = `
    relative flex items-center justify-center rounded-full
    ${sizeClasses[size]}
    ${isLocked ? 'bg-secondary-200 dark:bg-secondary-800' : 'bg-primary-100 dark:bg-primary-900/20'}
    ${className}
  `

  const iconClasses = `
    ${isLocked ? 'text-secondary-400 dark:text-secondary-600' : 'text-primary-600 dark:text-primary-400'}
  `

  return (
    <Tooltip content={
      <div className="space-y-1 p-2">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">{description}</p>
        <p className="text-xs text-secondary-400 dark:text-secondary-500">{category}</p>
      </div>
    }>
      <motion.div
        className={containerClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className={iconClasses}>{icon}</span>
        {isLocked && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg
              className="h-4 w-4 text-secondary-400 dark:text-secondary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </Tooltip>
  )
} 