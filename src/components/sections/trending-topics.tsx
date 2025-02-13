'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import { LoadingSpinner } from '../ui/loading-spinner'
import { ErrorMessage } from '../ui/error-message'

interface Topic {
  id: string;
  title: string;
  category: string;
  trend: 'up' | 'down' | 'neutral';
  debateCount: number;
}

const TRENDING_TOPICS_QUERY = gql`
  query TrendingTopics {
    trendingTopics {
      id
      title
      category
      trend
      debateCount
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

export function TrendingTopics() {
  const { loading, error, data } = useQuery<{ trendingTopics: Topic[] }>(TRENDING_TOPICS_QUERY, {
    fetchPolicy: 'network-only'
  })

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  if (!data) {
    return <ErrorMessage message="No topics found" />
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold text-secondary-900 dark:text-white">
          Trending Topics
        </h2>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {data.trendingTopics.map((topic) => (
            <motion.div
              key={topic.id}
              variants={item}
              className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-secondary-800"
            >
              <Link href={`/topics/${topic.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                      {topic.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/10 dark:text-primary-400">
                        {topic.category}
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {topic.debateCount} debates
                      </span>
                    </div>
                  </div>
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-full text-2xl
                    ${topic.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      topic.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
                  `}>
                    {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 