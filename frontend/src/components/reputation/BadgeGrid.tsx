'use client'

import { motion } from 'framer-motion'
import { Badge } from './Badge'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  isLocked?: boolean
}

interface BadgeGridProps {
  badges: BadgeData[]
  columns?: 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  badgeSize?: 'sm' | 'md' | 'lg'
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
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 }
}

export function BadgeGrid({
  badges,
  columns = 4,
  gap = 'md',
  badgeSize = 'md',
  className = ''
}: BadgeGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const containerClasses = `
    grid
    ${gridClasses[columns]}
    ${gapClasses[gap]}
    ${className}
  `

  return (
    <motion.div
      className={containerClasses}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {badges.map(badge => (
        <motion.div
          key={badge.id}
          variants={item}
          className="flex items-center justify-center"
        >
          <Badge
            name={badge.name}
            description={badge.description}
            icon={badge.icon}
            category={badge.category}
            isLocked={badge.isLocked}
            size={badgeSize}
          />
        </motion.div>
      ))}
    </motion.div>
  )
} 