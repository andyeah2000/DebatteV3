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
    refetchQueries: [{ query: GET_DEBATE, variables: { id: debateId } }]
  })

  const [incrementViewCountMutation] = useMutation(INCREMENT_VIEW_COUNT)

  // Add UUID validation function
  function isValidUUID(uuid: string) {
    // Basic format check for debate IDs
    const basicFormat = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return basicFormat.test(uuid.replace(/-/g, ''));
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

  if (!debateId || !isValidUUID(debateId)) {
    return null; // Don't show error, let the page component handle this
  }

  if (loading) return <LoadingSpinner data-testid="debate-loading" />
  if (apolloError) return <ErrorMessage message={apolloError.message} />

  const { debate } = data

  const proComments = debate.comments.filter((comment: any) => comment.isProArgument)
  const conComments = debate.comments.filter((comment: any) => !comment.isProArgument)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Debate Content */}
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <motion.h1 
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="mb-2 text-2xl font-bold text-foreground"
                >
                  {debate.title}
                </motion.h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Created by
                    </span>
                    <div className="flex items-center space-x-2">
                      {debate.author.avatarUrl && (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          src={debate.author.avatarUrl}
                          alt={debate.author.username}
                          className="h-6 w-6 rounded-full ring-2 ring-border"
                        />
                      )}
                      <span className="font-medium text-foreground">
                        {debate.author.username}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(debate.createdAt)}
                  </span>
                </div>
              </div>
              {session?.user && (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/debates/new')}
                    className="transition-all duration-200"
                  >
                    Start New Debate
                  </Button>
                </motion.div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {debate.description}
            </p>

            {/* Tags */}
            {debate.tags && debate.tags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {debate.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Debate Statistics */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/5"
              >
                <div className="text-sm text-muted-foreground">
                  Participants
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {debate.participantsCount}
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/5"
              >
                <div className="text-sm text-muted-foreground">
                  Views
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {debate.viewCount}
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/5"
              >
                <div className="text-sm text-muted-foreground">
                  Quality Score
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {debate.qualityScore}/100
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-card p-4 border border-border/50 transition-colors hover:bg-accent/5"
              >
                <div className="text-sm text-muted-foreground">
                  Source Quality
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {debate.sourceQualityScore}/100
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Arguments Section */}
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-1"
        >
          <ArgumentsSection
            proComments={proComments}
            conComments={conComments}
            onVote={handleVote}
            onReply={(commentId: string) => {
              // Handle reply logic here
              console.log('Reply to comment:', commentId);
            }}
            isLoggedIn={!!session?.user}
          />
        </motion.div>
      </div>
    </motion.div>
  )
} 