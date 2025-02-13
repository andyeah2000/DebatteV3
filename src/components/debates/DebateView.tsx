import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { useQuery, useMutation } from '@apollo/client'
import { GET_DEBATE } from '@/graphql/queries'
import { CREATE_COMMENT, INCREMENT_VIEW_COUNT } from '@/graphql/mutations'
import { Timeline } from '@/components/debate/timeline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import { ArgumentsSection } from '@/components/debate/arguments-section'
import type { Debate } from '@/types/debate'

interface DebateViewProps {
  debateId: string
}

export function DebateView({ debateId }: DebateViewProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isProArgument, setIsProArgument] = useState<boolean | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)

  const { loading, error: apolloError, data } = useQuery(GET_DEBATE, {
    variables: { id: debateId },
    pollInterval: 5000 // Poll every 5 seconds for updates
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
    refetchQueries: [{ query: GET_DEBATE, variables: { id: debateId } }]
  })

  const [incrementViewCountMutation] = useMutation(INCREMENT_VIEW_COUNT)

  // Add UUID validation function
  function isValidUUID(uuid: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async function handleVote(isProVote: boolean) {
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!debateId || !isValidUUID(debateId)) {
      setError('Invalid debate ID')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/graphql', {
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
              debateId,
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

      if (!debateId || !isValidUUID(debateId)) {
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
            debateId,
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
        variables: { id: debateId },
      })
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  if (loading) return <LoadingSpinner data-testid="debate-loading" />
  if (apolloError) return <ErrorMessage message={apolloError.message} />

  const { debate } = data

  const proComments = debate.comments.filter((comment: any) => comment.isProArgument)
  const conComments = debate.comments.filter((comment: any) => !comment.isProArgument)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Debate Content */}
        <div className="md:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-secondary-900 dark:text-white">
                  {debate.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      Created by
                    </span>
                    <div className="flex items-center space-x-2">
                      {debate.author.avatarUrl && (
                        <img
                          src={debate.author.avatarUrl}
                          alt={debate.author.username}
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {debate.author.username}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {formatDate(debate.createdAt)}
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
              {debate.description}
            </p>

            {/* Tags */}
            {debate.tags && debate.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {debate.tags.map((tag: string) => (
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
                  {debate.participantsCount}
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Views
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {debate.viewCount}
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Quality Score
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {debate.qualityScore}/100
                </div>
              </div>
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-800/50">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Source Quality
                </div>
                <div className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {debate.sourceQualityScore}/100
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
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Your Position
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={isProArgument === true ? 'default' : 'outline'}
                      onClick={() => setIsProArgument(true)}
                      className={isProArgument === true ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      Pro
                    </Button>
                    <Button
                      type="button"
                      variant={isProArgument === false ? 'default' : 'outline'}
                      onClick={() => setIsProArgument(false)}
                      className={isProArgument === false ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      Con
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                  >
                    Your Argument
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full rounded-lg border border-secondary-300 bg-white p-2.5 text-sm text-secondary-900 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white dark:placeholder-secondary-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                    placeholder="Write your argument here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    data-testid="comment-input"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Sources (Optional)
                  </label>
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => {
                            const newSources = [...sources]
                            newSources[index] = e.target.value
                            setSources(newSources)
                          }}
                          className="flex-1 rounded-lg border border-secondary-300 bg-white p-2 text-sm text-secondary-900 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white dark:placeholder-secondary-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                          placeholder="Enter source URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newSources = sources.filter((_, i) => i !== index)
                            setSources(newSources)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSources([...sources, ''])}
                    >
                      Add Source
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!newComment || isProArgument === null}
                    data-testid="submit-comment"
                  >
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
            events={debate.timeline}
            phases={debate.phases}
            currentPhase={debate.currentPhase}
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
                  <span className="text-sm text-secondary-500" data-testid="pro-votes">
                    {debate.voteStatistics.proPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${debate.voteStatistics.proPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Con
                  </span>
                  <span className="text-sm text-secondary-500" data-testid="con-votes">
                    {debate.voteStatistics.conPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${debate.voteStatistics.conPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {!hasVoted && session?.user && (
              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={() => handleVote(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  disabled={!debateId || !isValidUUID(debateId)}
                  data-testid="pro-vote-button"
                >
                  Vote Pro
                </Button>
                <Button
                  onClick={() => handleVote(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={!debateId || !isValidUUID(debateId)}
                  data-testid="con-vote-button"
                >
                  Vote Con
                </Button>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {debate.metadata?.aiAnalysis && (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
              <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                AI Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-secondary-500">Argument Quality</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {debate.metadata.aiAnalysis.argumentQuality}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{
                        width: `${debate.metadata.aiAnalysis.argumentQuality}%`,
                      }}
                    />
                  </div>
                </div>

                {debate.metadata.aiAnalysis.biasLevel !== undefined && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-secondary-500">Bias Level</span>
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {debate.metadata.aiAnalysis.biasLevel}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${debate.metadata.aiAnalysis.biasLevel}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {debate.metadata.biasTypes.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-secondary-900 dark:text-white">
                      Detected Bias Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {debate.metadata.biasTypes.map((bias: string) => (
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