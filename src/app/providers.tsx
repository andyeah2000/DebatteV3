'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ApolloClient, InMemoryCache, ApolloProvider, from } from '@apollo/client'
import { MotionConfig } from 'framer-motion'
import { onError } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { RetryLink } from '@apollo/client/link/retry'
import { useMemo } from 'react'

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
  return forward(operation)
})

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      const doNotRetry = [
        'FORBIDDEN',
        'UNAUTHENTICATED',
        'BAD_USER_INPUT',
        'VALIDATION_ERROR'
      ]
      return !!error && !doNotRetry.includes(error?.extensions?.code)
    }
  }
})

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const client = useMemo(() => new ApolloClient({
    link: from([errorLink, retryLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            debates: {
              merge(existing, incoming) {
                return incoming
              }
            },
            featuredDebates: {
              merge(existing, incoming) {
                return incoming
              }
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development'
  }), [])

  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionConfig reducedMotion="user">
            {children}
          </MotionConfig>
        </ThemeProvider>
      </ApolloProvider>
    </SessionProvider>
  )
} 