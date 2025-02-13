import { gql } from '@apollo/client'

export const GET_DEBATE = gql`
  query GetDebate($id: ID!) {
    debate(id: $id) {
      id
      title
      description
      category
      createdAt
      isActive
      author {
        id
        username
        avatarUrl
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
      qualityScore
      sourceQualityScore
      comments {
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
      voteStatistics {
        totalVotes
        proVotes
        conVotes
        proPercentage
        conPercentage
      }
    }
  }
`

export const GET_DEBATES = gql`
  query GetDebates($input: DebatesInput!) {
    debates(input: $input) {
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
      tags
      voteStatistics {
        totalVotes
        proVotes
        conVotes
        proPercentage
        conPercentage
      }
    }
  }
`

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($limit: Float, $offset: Float) {
    getUserNotifications(limit: $limit, offset: $offset) {
      id
      type
      priority
      title
      message
      isRead
      data
      createdAt
    }
  }
`

export const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationsCount {
    getUnreadNotificationsCount
  }
`

export const GET_ARGUMENT_TEMPLATES = gql`
  query GetArgumentTemplates {
    argumentTemplates {
      id
      name
      description
      category
      requiredSections
      optionalSections
      validationRules
      structure
      suggestedTransitions
      examplePhrases
      isActive
    }
  }
`

export const GET_TEMPLATE_EXAMPLES = gql`
  query GetTemplateExamples($id: ID!) {
    argumentTemplateExamples(id: $id)
  }
`

export const VALIDATE_ARGUMENT = gql`
  query ValidateArgument($templateId: ID!, $content: String!) {
    validateArgument(templateId: $templateId, content: $content)
  }
`

export const GET_ARGUMENT_SUGGESTIONS = gql`
  query GetArgumentSuggestions($templateId: ID!, $content: String!) {
    suggestArgumentImprovements(templateId: $templateId, content: $content)
  }
` 