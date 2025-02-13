import { gql } from '@apollo/client'

export const GET_WARNINGS = gql`
  query GetWarnings {
    warnings {
      id
      level
      status
      reason
      details
      expiresAt
      createdAt
      strikes
      user {
        id
        username
      }
      issuedBy {
        id
        username
      }
    }
  }
`

export const GET_USER_WARNINGS = gql`
  query GetUserWarnings($userId: ID!) {
    userWarnings(userId: $userId) {
      id
      level
      status
      reason
      details
      expiresAt
      createdAt
      strikes
      user {
        id
        username
      }
      issuedBy {
        id
        username
      }
    }
  }
`

export const GET_ACTIVE_WARNINGS = gql`
  query GetActiveWarnings($userId: ID!) {
    activeWarnings(userId: $userId) {
      id
      level
      status
      reason
      details
      expiresAt
      createdAt
      strikes
      user {
        id
        username
      }
      issuedBy {
        id
        username
      }
    }
  }
`

export const GET_USER_STRIKES = gql`
  query GetUserStrikes($userId: ID!) {
    userStrikesCount(userId: $userId)
  }
`

export const CREATE_WARNING = gql`
  mutation CreateWarning($input: CreateWarningInput!) {
    createWarning(input: $input) {
      id
      level
      status
      reason
      details
      expiresAt
      createdAt
      strikes
      user {
        id
        username
      }
      issuedBy {
        id
        username
      }
    }
  }
`

export const ACKNOWLEDGE_WARNING = gql`
  mutation AcknowledgeWarning($id: ID!) {
    acknowledgeWarning(id: $id) {
      id
      status
    }
  }
`

export const RESOLVE_WARNING = gql`
  mutation ResolveWarning($id: ID!, $note: String) {
    resolveWarning(id: $id, note: $note) {
      id
      status
    }
  }
` 