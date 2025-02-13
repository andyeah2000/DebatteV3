import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { DebateForm } from './DebateForm'
import { CREATE_DEBATE_MUTATION } from '@/graphql/mutations'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
}
;(useRouter as jest.Mock).mockReturnValue(mockRouter)

const mockCreateDebateSuccess = {
  request: {
    query: CREATE_DEBATE_MUTATION,
    variables: {
      title: 'Test Debate',
      description: 'Test Description',
      category: 'Politics',
    },
  },
  result: {
    data: {
      createDebate: {
        id: '1',
        title: 'Test Debate',
        description: 'Test Description',
        category: 'Politics',
        user: {
          id: '1',
          username: 'testuser',
        },
      },
    },
  },
}

const mockCreateDebateError = {
  request: {
    query: CREATE_DEBATE_MUTATION,
    variables: {
      title: 'Invalid Debate',
      description: 'Invalid Description',
      category: 'Invalid',
    },
  },
  error: new Error('Failed to create debate'),
}

describe('DebateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders debate form correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('handles successful debate creation', async () => {
    render(
      <MockedProvider mocks={[mockCreateDebateSuccess]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Debate' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Politics' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/debates/1')
    })
  })

  it('displays error message on failed debate creation', async () => {
    render(
      <MockedProvider mocks={[mockCreateDebateError]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Invalid Debate' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Invalid Description' },
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Invalid' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to create debate/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      expect(screen.getByText(/category is required/i)).toBeInTheDocument()
    })
  })

  it('validates title length', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'a'.repeat(101) },
    })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/title must be less than 100 characters/i)
      ).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    render(
      <MockedProvider mocks={[mockCreateDebateSuccess]} addTypename={false}>
        <DebateForm />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Debate' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Politics' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
}) 