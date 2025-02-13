import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    avatarUrl: String
    roles: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Debate {
    id: ID!
    title: String!
    description: String!
    author: User!
    createdAt: String!
    updatedAt: String!
    isActive: Boolean!
    viewCount: Int!
    participantsCount: Int!
    comments: [Comment!]!
    voteStatistics: VoteStatistics!
    tags: [String!]!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    debate: Debate!
    isProArgument: Boolean!
    createdAt: String!
    updatedAt: String!
    upvotes: Int!
    downvotes: Int!
    sources: [Source!]!
  }

  type Source {
    id: ID!
    url: String!
    title: String!
    credibilityScore: Float
    verificationStatus: VerificationStatus!
  }

  type VoteStatistics {
    totalVotes: Int!
    proVotes: Int!
    conVotes: Int!
    proPercentage: Float!
    conPercentage: Float!
  }

  enum VerificationStatus {
    PENDING
    VERIFIED
    REJECTED
  }

  type Query {
    me: User
    debate(id: ID!): Debate
    debates(
      skip: Int
      take: Int
      orderBy: String
      searchTerm: String
      tags: [String!]
    ): [Debate!]!
    featuredDebates: [Debate!]!
  }

  type Mutation {
    createDebate(input: CreateDebateInput!): Debate!
    updateDebate(id: ID!, input: UpdateDebateInput!): Debate!
    deleteDebate(id: ID!): Boolean!
    
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
    
    createVote(input: CreateVoteInput!): Vote!
    deleteVote(debateId: ID!): Boolean!
  }

  input CreateDebateInput {
    title: String!
    description: String!
    tags: [String!]!
  }

  input UpdateDebateInput {
    title: String
    description: String
    tags: [String!]
  }

  input CreateCommentInput {
    debateId: ID!
    content: String!
    isProArgument: Boolean!
    sources: [String!]
  }

  input UpdateCommentInput {
    content: String
    sources: [String!]
  }

  input CreateVoteInput {
    debateId: ID!
    isProVote: Boolean!
  }

  type Vote {
    id: ID!
    user: User!
    debate: Debate!
    isProVote: Boolean!
    createdAt: String!
  }
` 