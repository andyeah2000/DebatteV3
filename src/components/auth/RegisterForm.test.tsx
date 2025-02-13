import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { RegisterForm } from './RegisterForm'
import { REGISTER_MUTATION } from '@/graphql/mutations'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
}
;(useRouter as jest.Mock).mockReturnValue(mockRouter)

const mockRegisterSuccess = {
  request: {
    query: REGISTER_MUTATION,
    variables: {
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
    },
  },
  result: {
    data: {
      register: {
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

const mockRegisterError = {
  request: {
    query: REGISTER_MUTATION,
    variables: {
      email: 'existing@example.com',
      password: 'Password123!',
      username: 'existinguser',
    },
  },
  error: new Error('Email already exists'),
}

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders register form correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    render(
      <MockedProvider mocks={[mockRegisterSuccess]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/verify-email')
    })
  })

  it('displays error message on failed registration', async () => {
    render(
      <MockedProvider mocks={[mockRegisterError]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('validates password requirements', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'weak' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/password must contain at least one number/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/password must contain at least one special character/i)
      ).toBeInTheDocument()
    })
  })

  it('validates username requirements', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'a' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 3 characters/i)
      ).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    render(
      <MockedProvider mocks={[mockRegisterSuccess]} addTypename={false}>
        <RegisterForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
}) 