'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface ReputationEvent {
  id: string
  action: string
  points: number
  timestamp: string
  context?: {
    debateId?: string
    debateTitle?: string
    commentId?: string
    commentContent?: string
  }
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  isLocked?: boolean
}

interface ReputationState {
  total: number
  debate: number
  comment: number
  source: number
  badges: Badge[]
  history: ReputationEvent[]
  isLoading: boolean
  error: string | null
}

interface ReputationContextType extends ReputationState {
  refreshReputation: () => Promise<void>
  refreshBadges: () => Promise<void>
  refreshHistory: () => Promise<void>
}

const ReputationContext = createContext<ReputationContextType | undefined>(undefined)

export function useReputation() {
  const context = useContext(ReputationContext)
  if (context === undefined) {
    throw new Error('useReputation must be used within a ReputationProvider')
  }
  return context
}

interface ReputationProviderProps {
  children: React.ReactNode
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

interface RetryState {
  count: number
  timer: NodeJS.Timeout | null
}

export function ReputationProvider({ children }: ReputationProviderProps) {
  const { data: session } = useSession()
  const { socket } = useWebSocket()
  const [retryState, setRetryState] = useState<RetryState>({ count: 0, timer: null })

  const [state, setState] = useState<ReputationState>({
    total: 0,
    debate: 0,
    comment: 0,
    source: 0,
    badges: [],
    history: [],
    isLoading: true,
    error: null
  })

  const clearRetryTimer = useCallback(() => {
    if (retryState.timer) {
      clearTimeout(retryState.timer)
      setRetryState(prev => ({ ...prev, timer: null }))
    }
  }, [retryState.timer])

  const retryFetch = useCallback(async (
    fetchFn: () => Promise<void>,
    errorMessage: string
  ) => {
    try {
      await fetchFn()
      setRetryState({ count: 0, timer: null })
    } catch (error) {
      if (retryState.count < MAX_RETRIES) {
        const timer = setTimeout(() => {
          setRetryState(prev => ({ count: prev.count + 1, timer: null }))
          retryFetch(fetchFn, errorMessage)
        }, RETRY_DELAY * Math.pow(2, retryState.count))
        
        setRetryState(prev => ({ ...prev, timer }))
        
        setState(prev => ({
          ...prev,
          error: `${errorMessage} - Retrying... (${retryState.count + 1}/${MAX_RETRIES})`
        }))
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `${errorMessage} - Max retries reached`
        }))
      }
    }
  }, [retryState.count])

  async function fetchReputationData() {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserReputation($userId: ID!) {
              user(id: $userId) {
                reputationScore
                debateScore
                commentScore
                sourceScore
              }
            }
          `,
          variables: {
            userId: session.user.id
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)

      const { reputationScore, debateScore, commentScore, sourceScore } = data.data.user
      setState(prev => ({
        ...prev,
        total: reputationScore,
        debate: debateScore,
        comment: commentScore,
        source: sourceScore,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      throw error
    }
  }

  async function fetchBadges() {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserBadges($userId: ID!) {
              userBadges(userId: $userId) {
                badges {
                  id
                  name
                  description
                  icon
                  category
                }
              }
            }
          `,
          variables: {
            userId: session.user.id
          }
        })
      })

      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)

      setState(prev => ({
        ...prev,
        badges: data.data.userBadges.badges,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch badges'
      }))
    }
  }

  async function fetchHistory() {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetReputationHistory($userId: ID!) {
              reputationHistory(userId: $userId) {
                id
                action
                points
                timestamp
                context {
                  debateId
                  debateTitle
                  commentId
                  commentContent
                }
              }
            }
          `,
          variables: {
            userId: session.user.id
          }
        })
      })

      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)

      setState(prev => ({
        ...prev,
        history: data.data.reputationHistory,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch history'
      }))
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      retryFetch(
        fetchReputationData,
        'Failed to fetch reputation data'
      )
      retryFetch(
        fetchBadges,
        'Failed to fetch badges'
      )
      retryFetch(
        fetchHistory,
        'Failed to fetch history'
      )
    }

    return () => {
      clearRetryTimer()
    }
  }, [session?.user?.id, retryFetch, clearRetryTimer])

  useEffect(() => {
    if (!socket || !session?.user?.id) return

    socket.on('reputationUpdated', (data: {
      action: string
      points: number
      newScore: number
      context?: any
    }) => {
      setState(prev => ({
        ...prev,
        total: data.newScore,
        history: [{
          id: Date.now().toString(),
          action: data.action,
          points: data.points,
          timestamp: new Date().toISOString(),
          context: data.context
        }, ...prev.history]
      }))
    })

    socket.on('badgeAwarded', (data: Badge) => {
      setState(prev => ({
        ...prev,
        badges: [...prev.badges, data]
      }))
    })

    return () => {
      socket.off('reputationUpdated')
      socket.off('badgeAwarded')
    }
  }, [socket, session?.user?.id])

  const value = {
    ...state,
    refreshReputation: fetchReputationData,
    refreshBadges: fetchBadges,
    refreshHistory: fetchHistory
  }

  return (
    <ErrorBoundary>
      <ReputationContext.Provider value={value}>
        {children}
      </ReputationContext.Provider>
    </ErrorBoundary>
  )
} 