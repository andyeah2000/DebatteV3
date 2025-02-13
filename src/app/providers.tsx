'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ApolloClient, InMemoryCache, ApolloProvider, from } from '@apollo/client'
import { MotionConfig } from 'framer-motion'
import { PortManager } from '@/config/ports'
import { onError } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { RetryLink } from '@apollo/client/link/retry'
import { useEffect } from 'react'

// Initialize PortManager with fixed ports for development
const portManager = PortManager.getInstance()
portManager.setFrontendPort(3001) // Da der Frontend-Server auf 3001 läuft
portManager.setBackendPort(4000)  // Backend läuft auf 4000

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
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error
  }
})

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include'
})

const client = new ApolloClient({
  link: from([errorLink, retryLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
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