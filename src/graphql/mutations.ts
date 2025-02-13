import { gql } from '@apollo/client'

export const CREATE_DEBATE = gql`
  mutation CreateDebate($input: CreateDebateInput!) {
    createDebate(createDebateInput: $input) {
      id
      title
      description
      category
      author {
        id
        username
        avatarUrl
      }
    }
  }
`

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      isProArgument
      isVerified
      upvotes
      downvotes
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
      metadata {
        factCheck {
          suggestedSources
          isFactual
          corrections {
            claim
            correction
          }
        }
        aiAnalysis {
          argumentQuality
          biasLevel
          factualAccuracy
          moderationConfidence
        }
        argumentAnalysis {
          hasThesis
          hasLogicalFlow
          hasEvidence
          counterArgumentsAddressed
        }
      }
      author {
        id
        username
        avatarUrl
      }
    }
  }
`

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`

export const CLEAR_ALL_NOTIFICATIONS = gql`
  mutation ClearAllNotifications {
    clearAllNotifications
  }
` 