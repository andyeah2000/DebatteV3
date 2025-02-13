import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { DebateList } from './DebateList'
import { GET_DEBATES } from '@/graphql/queries'

const mockDebates = [
  {
    id: '1',
    title: 'First Debate',
    description: 'First Description',
    createdAt: new Date().toISOString(),
    user: {
      id: '1',
      username: 'user1',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    category: 'Politics',
    proVotes: 10,
    conVotes: 5,
    commentsCount: 3,
  },
  {
    id: '2',
    title: 'Second Debate',
    description: 'Second Description',
    createdAt: new Date().toISOString(),
    user: {
      id: '2',
      username: 'user2',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
    category: 'Technology',
    proVotes: 7,
    conVotes: 3,
    commentsCount: 1,
  },
]

const mocks = [
  {
    request: {
      query: GET_DEBATES,
      variables: { first: 10, skip: 0 },
    },
    result: {
      data: {
        debates: mockDebates,
      },
    },
  },
]

describe('DebateList', () => {
  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    expect(screen.getByTestId('debates-loading')).toBeInTheDocument()
  })

  it('renders debates after loading', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('First Debate')).toBeInTheDocument()
      expect(screen.getByText('Second Debate')).toBeInTheDocument()
    })
  })

  it('filters debates by category', async () => {
    const filteredMocks = [
      {
        request: {
          query: GET_DEBATES,
          variables: { first: 10, skip: 0, category: 'Politics' },
        },
        result: {
          data: {
            debates: [mockDebates[0]],
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={filteredMocks} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    const filterSelect = screen.getByTestId('category-filter')
    fireEvent.change(filterSelect, { target: { value: 'Politics' } })

    await waitFor(() => {
      expect(screen.getByText('First Debate')).toBeInTheDocument()
      expect(screen.queryByText('Second Debate')).not.toBeInTheDocument()
    })
  })

  it('sorts debates by different criteria', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    const sortSelect = screen.getByTestId('sort-select')
    fireEvent.change(sortSelect, { target: { value: 'votes' } })

    await waitFor(() => {
      const debates = screen.getAllByTestId('debate-card')
      expect(debates[0]).toHaveTextContent('First Debate')
      expect(debates[1]).toHaveTextContent('Second Debate')
    })
  })

  it('handles pagination correctly', async () => {
    const paginationMocks = [
      {
        request: {
          query: GET_DEBATES,
          variables: { first: 10, skip: 10 },
        },
        result: {
          data: {
            debates: mockDebates.map(debate => ({
              ...debate,
              id: (parseInt(debate.id) + 2).toString(),
            })),
          },
        },
      },
    ]

    render(
      <MockedProvider mocks={[...mocks, ...paginationMocks]} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('First Debate')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('load-more'))

    await waitFor(() => {
      expect(screen.getAllByTestId('debate-card')).toHaveLength(4)
    })
  })

  it('handles error state gracefully', async () => {
    const errorMock = {
      request: {
        query: GET_DEBATES,
        variables: { first: 10, skip: 0 },
      },
      error: new Error('Failed to fetch debates'),
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <DebateList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Error loading debates')).toBeInTheDocument()
    })
  })
}) 