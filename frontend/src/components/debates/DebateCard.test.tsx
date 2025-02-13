import { render, screen, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { DebateCard } from './DebateCard'
import { GET_DEBATE_VOTES } from '@/graphql/queries'

const mockDebate = {
  id: '1',
  title: 'Test Debate',
  description: 'Test Description',
  createdAt: new Date().toISOString(),
  user: {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  category: 'Politics',
  voteStatistics: {
    totalVotes: 8,
    proVotes: 5,
    conVotes: 3,
    proPercentage: 62.5,
    conPercentage: 37.5
  },
  commentsCount: 2,
}

const mocks = [
  {
    request: {
      query: GET_DEBATE_VOTES,
      variables: { debateId: '1' },
    },
    result: {
      data: {
        debateVotes: {
          proVotes: 5,
          conVotes: 3,
          totalVotes: 8,
          proPercentage: 62.5,
          conPercentage: 37.5,
        },
      },
    },
  },
]

describe('DebateCard', () => {
  it('renders debate information correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateCard debate={mockDebate} />
      </MockedProvider>
    )

    expect(screen.getByText(mockDebate.title)).toBeInTheDocument()
    expect(screen.getByText(mockDebate.description)).toBeInTheDocument()
    expect(screen.getByText(mockDebate.user.username)).toBeInTheDocument()
    expect(screen.getByText(mockDebate.category)).toBeInTheDocument()
  })

  it('displays vote counts correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateCard debate={mockDebate} />
      </MockedProvider>
    )

    expect(screen.getByTestId('pro-votes')).toHaveTextContent('5')
    expect(screen.getByTestId('con-votes')).toHaveTextContent('3')
  })

  it('navigates to debate page on click', () => {
    const mockRouter = {
      push: jest.fn(),
    }

    jest.mock('next/router', () => ({
      useRouter: () => mockRouter,
    }))

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateCard debate={mockDebate} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('debate-card'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/debates/${mockDebate.id}`)
  })

  it('shows loading state while fetching votes', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateCard debate={mockDebate} />
      </MockedProvider>
    )

    expect(screen.getByTestId('votes-loading')).toBeInTheDocument()
  })

  it('handles vote mutation errors gracefully', async () => {
    const errorMock = {
      request: {
        query: GET_DEBATE_VOTES,
        variables: { debateId: '1' },
      },
      error: new Error('Failed to fetch votes'),
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <DebateCard debate={mockDebate} />
      </MockedProvider>
    )

    const errorMessage = await screen.findByText('Error loading votes')
    expect(errorMessage).toBeInTheDocument()
  })
}) 