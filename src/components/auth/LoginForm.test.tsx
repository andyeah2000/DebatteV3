import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { LoginForm } from './LoginForm'
import { LOGIN_MUTATION } from '@/graphql/mutations'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
}
;(useRouter as jest.Mock).mockReturnValue(mockRouter)

const mockLoginSuccess = {
  request: {
    query: LOGIN_MUTATION,
    variables: {
      email: 'test@example.com',
      password: 'password123',
    },
  },
  result: {
    data: {
      login: {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
      },
    },
  },
}

const mockLoginError = {
  request: {
    query: LOGIN_MUTATION,
    variables: {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    },
  },
  error: new Error('Invalid credentials'),
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    render(
      <MockedProvider mocks={[mockLoginSuccess]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('displays error message on failed login', async () => {
    render(
      <MockedProvider mocks={[mockLoginError]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    render(
      <MockedProvider mocks={[mockLoginSuccess]} addTypename={false}>
        <LoginForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
}) 