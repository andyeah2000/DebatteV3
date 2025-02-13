import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  
  return {
    headers: {
      ...headers,
      authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});

export const client = new ApolloClient({
  link: retryLink.concat(errorLink.concat(authLink.concat(httpLink))),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
}); 