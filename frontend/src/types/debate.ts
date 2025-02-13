export interface TimelineEvent {
  id: string
  type: 'comment' | 'vote' | 'status_change' | 'milestone'
  timestamp: string
  userId?: string
  content?: string
  metadata?: string
}

export interface DebatePhase {
  name: string
  startTime: string
  endTime?: string
  isActive: boolean
  requirements: string[]
}

export interface Source {
  url: string
  title: string
  credibilityScore?: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface Media {
  type: 'image' | 'video' | 'infographic'
  url: string
  title: string
  description?: string
}

export interface Comment {
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

export interface Debate {
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