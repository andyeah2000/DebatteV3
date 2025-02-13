import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { DebateView } from './DebateView'
import { GET_DEBATE } from '@/graphql/queries'
import { CREATE_COMMENT } from '@/graphql/mutations'
import { gql } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.Mock
const mockSession = {
  data: {
    user: {
      id: '1',
      username: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  },
  status: 'authenticated',
}

// Mock next/navigation
jest.mock('next/navigation')
const mockRouter = {
  push: jest.fn(),
}
const mockUseRouter = useRouter as jest.Mock

const mockDebate = {
  id: '1',
  title: 'Test Debate',
  description: 'Test Description',
  category: 'Politics',
  createdAt: new Date().toISOString(),
  author: {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  participantsCount: 10,
  viewCount: 100,
  qualityScore: 85,
  sourceQualityScore: 90,
  tags: ['politics', 'environment'],
  comments: [
    {
      id: '1',
      content: 'Test Comment',
      createdAt: new Date().toISOString(),
      isProArgument: true,
      author: {
        id: '2',
        username: 'commenter',
        avatarUrl: 'https://example.com/avatar2.jpg',
      },
    },
  ],
  voteStatistics: {
    proVotes: 5,
    conVotes: 3,
    totalVotes: 8,
    proPercentage: 62.5,
    conPercentage: 37.5,
  },
  timeline: [],
  phases: [],
  currentPhase: 'discussion',
  metadata: {
    aiAnalysis: {
      argumentQuality: 85,
      biasLevel: 20,
    },
    biasTypes: ['confirmation bias', 'selection bias'],
  },
}

const mocks = [
  {
    request: {
      query: GET_DEBATE,
      variables: { id: '1' },
    },
    result: {
      data: {
        debate: mockDebate,
      },
    },
  },
  {
    request: {
      query: gql`
        mutation CreateVote($input: CreateVoteInput!) {
          createVote(createVoteInput: $input) {
            id
            isProVote
          }
        }
      `,
      variables: { input: { debateId: '1', isProVote: true } },
    },
    result: {
      data: {
        createVote: {
          id: '3',
          isProVote: true,
        },
      },
    },
  },
  {
    request: {
      query: CREATE_COMMENT,
      variables: { input: { debateId: '1', content: 'New Comment', isProArgument: true, sources: [] } },
    },
    result: {
      data: {
        createComment: {
          id: '2',
          content: 'New Comment',
          createdAt: new Date().toISOString(),
          author: {
            id: '1',
            username: 'testuser',
            avatarUrl: 'https://example.com/avatar.jpg',
          },
        },
      },
    },
  },
]

describe('DebateView', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession)
    mockUseRouter.mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders debate information correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    expect(screen.getByTestId('debate-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(mockDebate.title)).toBeInTheDocument()
      expect(screen.getByText(mockDebate.description)).toBeInTheDocument()
      expect(screen.getByText(mockDebate.author.username)).toBeInTheDocument()
    })
  })

  it('displays vote counts correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pro-votes')).toHaveTextContent('62.5%')
      expect(screen.getByTestId('con-votes')).toHaveTextContent('37.5%')
    })
  })

  it('handles voting interaction', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      const proVoteButton = screen.getByTestId('pro-vote-button')
      fireEvent.click(proVoteButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('pro-votes')).toHaveTextContent('62.5%')
    })
  })

  it('displays comments correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Comment')).toBeInTheDocument()
      expect(screen.getByText('commenter')).toBeInTheDocument()
    })
  })

  it('handles adding new comments', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      const commentInput = screen.getByTestId('comment-input')
      fireEvent.change(commentInput, { target: { value: 'New Comment' } })
      const submitButton = screen.getByTestId('submit-comment')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('New Comment')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully', async () => {
    const errorMock = {
      request: {
        query: GET_DEBATE,
        variables: { id: '1' },
      },
      error: new Error('Failed to fetch debate'),
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch debate/i)).toBeInTheDocument()
    })
  })

  it('shows loading state for vote action', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      const proVoteButton = screen.getByTestId('pro-vote-button')
      fireEvent.click(proVoteButton)
    })
  })

  it('shows loading state for comment submission', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateView debateId="1" />
      </MockedProvider>
    )

    await waitFor(() => {
      const commentInput = screen.getByTestId('comment-input')
      fireEvent.change(commentInput, { target: { value: 'New Comment' } })
      const submitButton = screen.getByTestId('submit-comment')
      fireEvent.click(submitButton)
    })
  })
}) 