'use client'

import { useQuery, gql } from '@apollo/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'

interface Debate {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  participantsCount: number
  viewCount: number
  qualityScore: number
  sourceQualityScore: number
  currentPhase: string
  isActive: boolean
  isFeatured: boolean
  timeline: Array<{
    id: string
    type: string
    timestamp: string
    content?: string
    userId?: string
    metadata?: string
  }>
  phases: Array<{
    name: string
    startTime: string
    endTime?: string
    isActive: boolean
  }>
  voteStatistics: {
    totalVotes: number
    proVotes: number
    conVotes: number
    proPercentage: number
    conPercentage: number
  }
}

const FEATURED_DEBATES_QUERY = gql`
  query FeaturedDebates {
    featuredDebates {
      id
      title
      description
      category
      createdAt
      author {
        id
        username
        avatarUrl
      }
      participantsCount
      viewCount
      qualityScore
      sourceQualityScore
      currentPhase
      isActive
      isFeatured
      timeline {
        id
        type
        timestamp
        content
        userId
        metadata
      }
      phases {
        name
        startTime
        endTime
        isActive
        requirements
      }
      voteStatistics {
        totalVotes
        proVotes
        conVotes
        proPercentage
        conPercentage
      }
    }
  }
`

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

export function FeaturedDebates() {
  const { loading, error, data } = useQuery<{ featuredDebates: Debate[] }>(FEATURED_DEBATES_QUERY, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Featured debates query error:', error);
    }
  })

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-secondary-200 bg-white p-6 shadow-sm dark:border-secondary-800 dark:bg-secondary-900"
          >
            <div className="h-4 w-24 rounded bg-secondary-200 dark:bg-secondary-700" />
            <div className="mt-4 h-6 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
            <div className="mt-2 h-16 rounded bg-secondary-200 dark:bg-secondary-700" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading featured debates</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const debates = data?.featuredDebates || []

  if (debates.length === 0) {
    return (
      <div className="rounded-lg bg-secondary-50 p-8 text-center dark:bg-secondary-900">
        <p className="text-secondary-600 dark:text-secondary-400">
          No featured debates available at the moment.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {debates.map((debate) => (
        <motion.div
          key={debate.id}
          variants={item}
          className="group relative overflow-hidden rounded-lg border border-secondary-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-secondary-800 dark:bg-secondary-900"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/10 dark:text-primary-400">
                {debate.category}
              </span>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                {formatDate(new Date(debate.createdAt))}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-semibold text-secondary-900 dark:text-white">
              <Link href={`/debates/${debate.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                {debate.title}
              </Link>
            </h3>

            <p className="mt-2 line-clamp-2 text-secondary-600 dark:text-secondary-400">
              {debate.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={debate.author.avatarUrl || `https://ui-avatars.com/api/?name=${debate.author.username}`}
                  alt={debate.author.username}
                  className="h-6 w-6 rounded-full"
                />
                <span className="text-sm text-secondary-700 dark:text-secondary-300">{debate.author.username}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {debate.voteStatistics.proPercentage.toFixed(1)}%
                </span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  {debate.voteStatistics.conPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary-500 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                  {debate.participantsCount} participants
                </span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary-500 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                  Quality: {debate.qualityScore.toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
} 