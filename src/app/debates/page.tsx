'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { GET_DEBATES } from '@/graphql/queries'

interface Debate {
  id: string
  title: string
  description: string
  category: string
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  createdAt: string
  participantsCount: number
  tags: string[]
  viewCount: number
  voteStatistics: {
    totalVotes: number
    proVotes: number
    conVotes: number
    proPercentage: number
    conPercentage: number
  }
}

const CATEGORIES = [
  'Politics',
  'Economics',
  'Technology',
  'Environment',
  'Society',
  'Education',
  'Healthcare',
  'Culture',
]

const SORT_OPTIONS = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Active', value: 'active' },
]

export default function DebatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [debates, setDebates] = useState<Debate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { loading, error: queryError, data } = useQuery(GET_DEBATES, {
    variables: {
      input: {
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        page,
        limit: 10
      }
    },
    onError: (error) => {
      console.error('Error fetching debates:', error);
      setError(error.message);
    }
  });

  useEffect(() => {
    if (data?.debates) {
      const formattedDebates = data.debates.map((debate: any) => ({
        ...debate,
        createdAt: new Date(debate.createdAt).toISOString()
      }));
      
      if (page === 1) {
        setDebates(formattedDebates);
      } else {
        setDebates(prev => [...prev, ...formattedDebates]);
      }
      setHasMore(data.debates.length === 10);
      setIsLoading(false);
    }
  }, [data, page]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    router.push(`/debates?q=${searchTerm}&category=${selectedCategory}&sort=${sortBy}`)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-white">
            Debates
          </h1>
          <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-400">
            Explore and participate in meaningful discussions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-lg bg-white p-4 shadow-sm dark:bg-secondary-800">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search debates..."
                className="flex-1 rounded-md border border-secondary-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white"
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-md border border-secondary-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-md border border-secondary-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </div>

        {/* Debates List */}
        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/10 dark:text-red-400">
            {error}
          </div>
        ) : isLoading && page === 1 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg bg-secondary-100 dark:bg-secondary-800"
              />
            ))}
          </div>
        ) : debates.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              No debates found. Try adjusting your filters or{' '}
              <Link
                href="/debates/new"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                start a new debate
              </Link>
              .
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {debates.map(debate => (
              <motion.div
                key={debate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-secondary-800"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/debates/${debate.id}`}
                      className="text-xl font-semibold text-secondary-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                    >
                      {debate.title}
                    </Link>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                      {debate.category}
                    </span>
                  </div>

                  <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                    {debate.description.length > 200
                      ? `${debate.description.slice(0, 200)}...`
                      : debate.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={debate.author.avatarUrl || `https://ui-avatars.com/api/?name=${debate.author.username}`}
                        alt={debate.author.username}
                        className="h-6 w-6 rounded-full"
                      />
                      <span>{debate.author.username}</span>
                    </div>
                    <span>{formatDate(new Date(debate.createdAt))}</span>
                    <span>{debate.participantsCount} participants</span>
                    <span>{debate.viewCount} views</span>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 dark:text-green-400">
                        {debate.voteStatistics.proVotes} pros
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {debate.voteStatistics.conVotes} cons
                      </span>
                    </div>
                  </div>

                  {debate.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {debate.tags.map(tag => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
} 