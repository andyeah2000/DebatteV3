'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client'
import { GET_DEBATE } from '@/graphql/queries'
import { CREATE_COMMENT, INCREMENT_VIEW_COUNT } from '@/graphql/mutations'
import { Timeline } from '@/components/debate/timeline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import { ArgumentsSection } from '@/components/debate/arguments-section'
import type { Debate as DebateType } from '@/types/debate'

interface TimelineEvent {
  id: string
  type: 'comment' | 'vote' | 'status_change' | 'milestone'
  timestamp: string
  userId?: string
  content?: string
  metadata?: string
}

interface DebatePhase {
  name: string
  startTime: string
  endTime?: string
  isActive: boolean
  requirements: string[]
}

interface Source {
  url: string
  title: string
  credibilityScore?: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

interface Media {
  type: 'image' | 'video' | 'infographic'
  url: string
  title: string
  description?: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  isProArgument: boolean
  metadata: {
    factCheck: {
      suggestedSources: string[]
      isFactual: boolean
      corrections?: Array<{
        claim: string
        correction: string
      }>
    }
    aiAnalysis: {
      argumentQuality: number
      biasLevel?: number
      factualAccuracy?: number
      moderationConfidence: number
    }
    argumentAnalysis: {
      hasThesis: boolean
      hasLogicalFlow: boolean
      hasEvidence: boolean
      counterArgumentsAddressed: boolean
    }
  }
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  sources: Source[]
  media: Media[]
  upvotes: number
  downvotes: number
  isVerified: boolean
  replyTo?: Comment
}

interface Debate {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  isActive: boolean
  isModerated: boolean
  isEnded: boolean
  isFeatured: boolean
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  timeline: TimelineEvent[]
  phases: DebatePhase[]
  currentPhase: string
  qualityScore: number
  sourceQualityScore: number
  participantsCount: number
  viewCount: number
  comments: Comment[]
  voteStatistics: {
    totalVotes: number
    proVotes: number
    conVotes: number
    proPercentage: number
    conPercentage: number
  }
  metadata: {
    aiAnalysis: {
      argumentQuality: number
      biasLevel?: number
      factualAccuracy?: number
      moderationConfidence: number
    }
    argumentStrengths: string[]
    argumentWeaknesses: string[]
    biasTypes: string[]
    suggestions: string[]
  }
  tags: string[]
  requiredSources: string[]
  summary?: string
  winningPosition?: string
}

export default function DebateDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session } = useSession()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isProArgument, setIsProArgument] = useState<boolean | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)

  const { loading, error: apolloError, data } = useQuery(GET_DEBATE, {
    variables: { id },
    onError: (error) => {
      console.error('Error in debate query:', error);
    }
  })

  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      // Clear form after successful submission
      setNewComment('')
      setSources([])
      setIsProArgument(null)
      setError('')
    },
    onError: (error) => {
      console.error('Failed to post comment:', error)
      setError(error.message || 'Failed to post comment. Please try again.')
    },
    refetchQueries: [{ query: GET_DEBATE, variables: { id } }]
  })

  const [incrementViewCountMutation] = useMutation(INCREMENT_VIEW_COUNT)

  // Add UUID validation function
  function isValidUUID(uuid: string) {
    // Basic format check for debate IDs
    const basicFormat = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return basicFormat.test(uuid.replace(/-/g, ''));
  }

  useEffect(() => {
    // Only show invalid ID error if the ID is clearly invalid
    if (id && typeof id === 'string' && id.length > 0 && !isValidUUID(id)) {
      setError('Invalid debate ID');
      return;
    }
    
    setError(''); // Clear error if ID is valid or empty
    
    if (id && typeof id === 'string' && id.length > 0) {
      fetchDebate();
      checkUserVote();
    }
  }, [id]);

  async function fetchDebate() {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetDebate($id: ID!) {
              debate(id: $id) {
                id
                title
                description
                category
                author {
                  id
                  username
                  avatarUrl
                }
                createdAt
                scheduledEndTime
                participantsCount
                tags
                isActive
                viewCount
                comments {
                  id
                  content
                  author {
                    id
                    username
                    avatarUrl
                  }
                  createdAt
                  isProArgument
                  sources {
                    id
                    url
                    title
                    credibilityScore
                    verificationStatus
                  }
                  media {
                    id
                    type
                    url
                    title
                    description
                  }
                  upvotes
                  downvotes
                  isVerified
                }
                voteStatistics {
                  proVotes
                  conVotes
                  totalVotes
                  proPercentage
                  conPercentage
                }
                timeline {
                  id
                  type
                  timestamp
                  userId
                  content
                  metadata
                }
                phases {
                  name
                  startTime
                  endTime
                  isActive
                  requirements
                }
                currentPhase
              }
            }
          `,
          variables: { id },
        }),
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setDebate(data.data.debate)
      incrementViewCount()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load debate')
    } finally {
      setIsLoading(false)
    }
  }

  async function checkUserVote() {
    if (!session?.user) return
    if (!id || !isValidUUID(id as string)) return

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query HasUserVoted($debateId: ID!) {
              hasUserVoted(debateId: $debateId)
            }
          `,
          variables: { debateId: id },
        }),
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setHasVoted(data.data.hasUserVoted)
    } catch (error) {
      console.error('Failed to check user vote:', error)
    }
  }

  async function handleVote(isProVote: boolean) {
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!id || !isValidUUID(id as string)) {
      setError('Invalid debate ID')
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation CreateVote($input: CreateVoteInput!) {
              createVote(createVoteInput: $input) {
                id
                isProVote
              }
            }
          `,
          variables: {
            input: {
              debateId: id,
              isProVote,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setHasVoted(true)
      fetchDebate() // Refresh debate data to update vote counts
    } catch (error) {
      console.error('Failed to submit vote:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit vote')
    }
  }

  async function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault()
    
    try {
      if (!session?.user) {
        router.push('/login')
        return
      }

      if (!id || !isValidUUID(id as string)) {
        setError('Invalid debate ID')
        return
      }

      if (isProArgument === null) {
        setError('Please select whether this is a pro or con argument')
        return
      }

      if (!newComment.trim()) {
        setError('Please enter your argument')
        return
      }

      await createComment({
        variables: {
          input: {
            debateId: id,
            content: newComment.trim(),
            isProArgument,
            sources: sources.filter(s => s.trim()), // Filter out empty sources
          },
        },
      })
    } catch (error) {
      console.error('Failed to post comment:', error)
      setError(error instanceof Error ? error.message : 'Failed to post comment. Please try again.')
    }
  }

  async function incrementViewCount() {
    try {
      await incrementViewCountMutation({
        variables: { id },
      })
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  if (loading) return <LoadingSpinner />
  if (apolloError) return <ErrorMessage message={apolloError.message} />

  const { debate: apolloDebate } = data

  const proComments = apolloDebate.comments.filter((comment: Comment) => comment.isProArgument)
  const conComments = apolloDebate.comments.filter((comment: Comment) => !comment.isProArgument)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Debate Content */}
        <div className="md:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-secondary-900 dark:text-white">
                  {apolloDebate.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      Created by
                    </span>
                    <div className="flex items-center space-x-2">
                      {apolloDebate.author.avatarUrl && (
                        <img
                          src={apolloDebate.author.avatarUrl}
                          alt={apolloDebate.author.username}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {apolloDebate.author.username}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {formatDate(apolloDebate.createdAt)}
                  </span>
                </div>
              </div>
              {session?.user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/debates/new')}
                >
                  Start New Debate
                </Button>
              )}
            </div>

            <p className="text-secondary-600 dark:text-secondary-400">
              {apolloDebate.description}
            </p>

            {/* Tags */}
            {apolloDebate.tags && apolloDebate.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {apolloDebate.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary-100 px-3 py-1 text-sm text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Debate Statistics */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Participants
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {apolloDebate.participantsCount}
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Views
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {apolloDebate.viewCount}
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Quality Score
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {apolloDebate.qualityScore}/100
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Source Quality
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {apolloDebate.sourceQualityScore}/100
                </div>
              </div>
            </div>
          </div>

          {/* Arguments Section */}
          <div className="mt-8">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <ArgumentsSection
              proComments={proComments || []}
              conComments={conComments || []}
              onVote={handleVote}
              onReply={(commentId: string) => {
                // Handle reply
              }}
              isLoggedIn={!!session?.user}
            />
          </div>

          {/* Comment Form */}
          {session?.user && (
            <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
              <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                Add Your Argument
              </h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Position
                  </label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={isProArgument === true ? 'default' : 'outline'}
                      onClick={() => setIsProArgument(true)}
                    >
                      Pro
                    </Button>
                    <Button
                      type="button"
                      variant={isProArgument === false ? 'default' : 'outline'}
                      onClick={() => setIsProArgument(false)}
                    >
                      Con
                    </Button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                  >
                    Your Argument
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="block w-full rounded-md border border-secondary-300 bg-white px-4 py-2 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder-secondary-500"
                    placeholder="Share your perspective..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Sources
                  </label>
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-secondary-50 p-2 dark:bg-secondary-800/50"
                      >
                        <span className="text-sm text-secondary-700 dark:text-secondary-300">
                          {source}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSources(sources.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add source URL"
                      className="block w-full rounded-md border border-secondary-300 bg-white px-4 py-2 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder-secondary-500"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value && !sources.includes(value)) {
                            setSources([...sources, value])
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!newComment || isProArgument === null}>
                    Post Argument
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Timeline Component */}
          <Timeline
            events={apolloDebate.timeline}
            phases={apolloDebate.phases}
            currentPhase={apolloDebate.currentPhase}
          />

          {/* Vote Statistics */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
            <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
              Vote Distribution
            </h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Pro
                  </span>
                  <span className="text-sm text-secondary-500">
                    {Number(apolloDebate.voteStatistics.proPercentage).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${apolloDebate.voteStatistics.proPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Con
                  </span>
                  <span className="text-sm text-secondary-500">
                    {Number(apolloDebate.voteStatistics.conPercentage).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${apolloDebate.voteStatistics.conPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {!hasVoted && session?.user && (
              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={() => handleVote(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  disabled={!id || !isValidUUID(id as string)}
                >
                  Vote Pro
                </Button>
                <Button
                  onClick={() => handleVote(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={!id || !isValidUUID(id as string)}
                >
                  Vote Con
                </Button>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {apolloDebate.metadata?.aiAnalysis && (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
              <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                AI Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-secondary-500">Argument Quality</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {apolloDebate.metadata.aiAnalysis.argumentQuality}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{
                        width: `${apolloDebate.metadata.aiAnalysis.argumentQuality}%`,
                      }}
                    />
                  </div>
                </div>

                {apolloDebate.metadata.aiAnalysis.biasLevel !== undefined && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-secondary-500">Bias Level</span>
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {apolloDebate.metadata.aiAnalysis.biasLevel}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${apolloDebate.metadata.aiAnalysis.biasLevel}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {apolloDebate.metadata.biasTypes.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-secondary-900 dark:text-white">
                      Detected Bias Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {apolloDebate.metadata.biasTypes.map((bias: string) => (
                        <span
                          key={bias}
                          className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        >
                          {bias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 