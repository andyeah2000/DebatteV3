import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { MockedProvider } from '@apollo/client/testing'
import { ME_QUERY } from '@/graphql/queries'

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  roles: ['user'],
}

const mocks = [
  {
    request: {
      query: ME_QUERY,
    },
    result: {
      data: {
        me: mockUser,
      },
    },
  },
]

const TestComponent = () => {
  const { user, loading, error } = useAuth()
  
  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">{error.message}</div>
  if (!user) return <div data-testid="no-user">No user</div>
  
  return (
    <div data-testid="user-info">
      <div>{user.email}</div>
      <div>{user.username}</div>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides user data when authenticated', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('user-info')).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    expect(screen.getByText(mockUser.username)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    const errorMock = {
      request: {
        query: ME_QUERY,
      },
      error: new Error('Failed to fetch user'),
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch user')).toBeInTheDocument()
  })

  it('handles no user state', async () => {
    const noUserMock = {
      request: {
        query: ME_QUERY,
      },
      result: {
        data: {
          me: null,
        },
      },
    }

    render(
      <MockedProvider mocks={[noUserMock]} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('no-user')).toBeInTheDocument()
  })
}) 