'use client'

import { useQuery, gql } from '@apollo/client'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'

const TOPIC_DETAILS_QUERY = gql`
  query TopicDetails($id: ID!) {
    topic(id: $id) {
      id
      title
      description
      category
      trend
      debateCount
      debates {
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
        voteStatistics {
          totalVotes
          proVotes
          conVotes
          proPercentage
          conPercentage
        }
      }
      relatedTopics {
        id
        title
        debateCount
        trend
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

export default function TopicPage() {
  const params = useParams()
  const { loading, error, data } = useQuery(TOPIC_DETAILS_QUERY, {
    variables: { id: params.id },
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  const { topic } = data

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <div className="container mx-auto px-4 py-8">
        {/* Topic Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              {topic.title}
            </h1>
            <div className={`
              flex h-12 w-12 items-center justify-center rounded-full text-2xl
              ${topic.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                topic.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
            `}>
              {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'}
            </div>
          </div>
          <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-400">
            {topic.description}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/10 dark:text-primary-400">
              {topic.category}
            </span>
            <span className="text-sm text-secondary-500 dark:text-secondary-400">
              {topic.debateCount} debates
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Debates */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-2xl font-bold text-secondary-900 dark:text-white">
              Debates
            </h2>
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {topic.debates.map((debate: {
                id: string;
                title: string;
                description: string;
                category: string;
                createdAt: string;
                author: {
                  id: string;
                  username: string;
                  avatarUrl?: string;
                };
                participantsCount: number;
                viewCount: number;
                qualityScore: number;
                voteStatistics: {
                  totalVotes: number;
                  proVotes: number;
                  conVotes: number;
                  proPercentage: number;
                  conPercentage: number;
                };
              }) => (
                <motion.div
                  key={debate.id}
                  variants={item}
                  className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-secondary-800"
                >
                  <Link
                    href={`/debates/${debate.id}`}
                    className="block"
                  >
                    <h3 className="text-xl font-semibold text-secondary-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400">
                      {debate.title}
                    </h3>
                    <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                      {debate.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={debate.author.avatarUrl || `https://ui-avatars.com/api/?name=${debate.author.username}`}
                          alt={debate.author.username}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                          {debate.author.username}
                        </span>
                      </div>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {formatDate(new Date(debate.createdAt))}
                      </span>
                      <div className="flex items-center gap-4">
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
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Sidebar - Related Topics */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-secondary-900 dark:text-white">
              Related Topics
            </h2>
            <div className="space-y-4">
              {topic.relatedTopics.map((relatedTopic: {
                id: string;
                title: string;
                debateCount: number;
                trend: 'up' | 'down' | 'neutral';
              }) => (
                <Link
                  key={relatedTopic.id}
                  href={`/topics/${relatedTopic.id}`}
                  className="block rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-secondary-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400">
                        {relatedTopic.title}
                      </h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {relatedTopic.debateCount} debates
                      </p>
                    </div>
                    <div className={`
                      flex h-8 w-8 items-center justify-center rounded-full text-lg
                      ${relatedTopic.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        relatedTopic.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
                    `}>
                      {relatedTopic.trend === 'up' ? '↑' : relatedTopic.trend === 'down' ? '↓' : '→'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 