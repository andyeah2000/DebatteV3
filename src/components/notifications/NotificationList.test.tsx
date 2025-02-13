import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { NotificationList } from './NotificationList'
import { GET_NOTIFICATIONS } from '@/graphql/queries'
import { MARK_NOTIFICATION_AS_READ } from '@/graphql/mutations'

const mockNotifications = [
  {
    id: '1',
    title: 'New Comment',
    message: 'Someone commented on your debate',
    type: 'COMMENT',
    isRead: false,
    createdAt: new Date().toISOString(),
    debate: {
      id: '1',
      title: 'Test Debate',
    },
  },
  {
    id: '2',
    title: 'New Vote',
    message: 'Someone voted on your debate',
    type: 'VOTE',
    isRead: true,
    createdAt: new Date().toISOString(),
    debate: {
      id: '2',
      title: 'Another Debate',
    },
  },
]

const mocks = [
  {
    request: {
      query: GET_NOTIFICATIONS,
    },
    result: {
      data: {
        notifications: mockNotifications,
      },
    },
  },
  {
    request: {
      query: MARK_NOTIFICATION_AS_READ,
      variables: { id: '1' },
    },
    result: {
      data: {
        markNotificationAsRead: {
          id: '1',
          isRead: true,
        },
      },
    },
  },
]

describe('NotificationList', () => {
  it('renders notifications correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    expect(screen.getByTestId('notifications-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('New Comment')).toBeInTheDocument()
      expect(screen.getByText('New Vote')).toBeInTheDocument()
    })
  })

  it('displays unread indicator for unread notifications', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    await waitFor(() => {
      const unreadNotification = screen.getByTestId('notification-1')
      expect(unreadNotification).toHaveClass('unread')
    })
  })

  it('marks notification as read when clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    await waitFor(() => {
      const notification = screen.getByTestId('notification-1')
      fireEvent.click(notification)
    })

    await waitFor(() => {
      const notification = screen.getByTestId('notification-1')
      expect(notification).not.toHaveClass('unread')
    })
  })

  it('displays empty state when no notifications', async () => {
    const emptyMock = {
      request: {
        query: GET_NOTIFICATIONS,
      },
      result: {
        data: {
          notifications: [],
        },
      },
    }

    render(
      <MockedProvider mocks={[emptyMock]} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    })
  })

  it('handles error state gracefully', async () => {
    const errorMock = {
      request: {
        query: GET_NOTIFICATIONS,
      },
      error: new Error('Failed to fetch notifications'),
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading notifications/i)).toBeInTheDocument()
    })
  })

  it('groups notifications by date', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const groupedMock = {
      request: {
        query: GET_NOTIFICATIONS,
      },
      result: {
        data: {
          notifications: [
            {
              ...mockNotifications[0],
              createdAt: today.toISOString(),
            },
            {
              ...mockNotifications[1],
              createdAt: yesterday.toISOString(),
            },
          ],
        },
      },
    }

    render(
      <MockedProvider mocks={[groupedMock]} addTypename={false}>
        <NotificationList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/today/i)).toBeInTheDocument()
      expect(screen.getByText(/yesterday/i)).toBeInTheDocument()
    })
  })
}) 