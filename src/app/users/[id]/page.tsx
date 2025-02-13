'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  isVerified: boolean
  reputationScore: number
  debates: Debate[]
  comments: Comment[]
  votes: Vote[]
}

interface Debate {
  id: string
  title: string
  category: string
  createdAt: string
  participantsCount: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  debate: {
    id: string
    title: string
  }
  upvotes: number
  downvotes: number
}

interface Vote {
  id: string
  isProVote: boolean
  createdAt: string
  debate: {
    id: string
    title: string
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'debates' | 'comments' | 'votes'>('debates')

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetUserProfile($id: ID!) {
                user(id: $id) {
                  id
                  username
                  email
                  avatarUrl
                  bio
                  createdAt
                  isVerified
                  reputationScore
                  debates {
                    id
                    title
                    category
                    createdAt
                    participantsCount
                  }
                  comments {
                    id
                    content
                    createdAt
                    debate {
                      id
                      title
                    }
                    upvotes
                    downvotes
                  }
                  votes {
                    id
                    isProVote
                    createdAt
                    debate {
                      id
                      title
                    }
                  }
                }
              }
            `,
            variables: {
              id: params.id,
            },
          }),
        })

        const data = await response.json()

        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        setUser(data.data.user)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {error || 'User not found'}
          </h2>
          <Link
            href="/"
            className="mt-4 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-secondary-800">
          <div className="flex items-start space-x-6">
            <Image
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`}
              alt={user.username}
              width={96}
              height={96}
              className="rounded-full"
              priority
            />
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {user.username}
                </h1>
                {user.isVerified && (
                  <svg
                    className="h-6 w-6 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-2 text-secondary-600 dark:text-secondary-400">{user.bio}</p>
              <div className="mt-4 flex space-x-6">
                <div>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Member since
                  </span>
                  <p className="font-medium text-secondary-900 dark:text-white">
                    {formatDate(new Date(user.createdAt))}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Reputation
                  </span>
                  <p className="font-medium text-secondary-900 dark:text-white">
                    {user.reputationScore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200 dark:border-secondary-700">
          <nav className="-mb-px flex space-x-8">
            {(['debates', 'comments', 'votes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  border-b-2 px-1 pb-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                      : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 dark:text-secondary-400 dark:hover:border-secondary-600 dark:hover:text-secondary-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
                <span className="ml-2 rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400">
                  {user[tab].length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'debates' &&
            user.debates.map(debate => (
              <Link
                key={debate.id}
                href={`/debates/${debate.id}`}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-secondary-800"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                    {debate.title}
                  </h3>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                    {debate.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400">
                  <span>{formatDate(new Date(debate.createdAt))}</span>
                  <span>{debate.participantsCount} participants</span>
                </div>
              </Link>
            ))}

          {activeTab === 'comments' &&
            user.comments.map(comment => (
              <div
                key={comment.id}
                className="rounded-lg bg-white p-6 shadow dark:bg-secondary-800"
              >
                <Link
                  href={`/debates/${comment.debate.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {comment.debate.title}
                </Link>
                <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                  {comment.content}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <span className="text-secondary-500 dark:text-secondary-400">
                    {formatDate(new Date(comment.createdAt))}
                  </span>
                  <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.586V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{comment.upvotes}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 8.707l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 011.414 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{comment.downvotes}</span>
                  </span>
                </div>
              </div>
            ))}

          {activeTab === 'votes' &&
            user.votes.map(vote => (
              <div
                key={vote.id}
                className="rounded-lg bg-white p-6 shadow dark:bg-secondary-800"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/debates/${vote.debate.id}`}
                    className="text-lg font-medium text-secondary-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                  >
                    {vote.debate.title}
                  </Link>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      vote.isProVote
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {vote.isProVote ? 'Pro' : 'Con'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                  {formatDate(new Date(vote.createdAt))}
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
} 