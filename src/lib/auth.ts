import { NextAuthOptions, Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import { JWT } from 'next-auth/jwt'

interface ExtendedUser extends Omit<User, 'roles'> {
  roles: string[]
  accessToken: string
}

interface ExtendedSession extends Omit<Session, 'accessToken'> {
  accessToken: string
  roles: string[]
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password')
        }
        
        try {
          const res = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              query: `
                mutation Login($loginInput: LoginInput!) {
                  login(loginInput: $loginInput) {
                    user {
                      id
                      email
                      username
                      avatarUrl
                      roles
                    }
                    token
                  }
                }
              `,
              variables: {
                loginInput: {
                  email: credentials.email,
                  password: credentials.password,
                },
              },
            }),
          })

          if (!res.ok) {
            throw new Error('Failed to authenticate')
          }

          const data = await res.json()
          
          if (data.errors) {
            const errorMessage = data.errors[0].message
            console.error('Login error:', errorMessage)
            throw new Error(errorMessage)
          }

          if (!data.data?.login) {
            throw new Error('Invalid response from server')
          }

          const { user, token } = data.data.login

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            image: user.avatarUrl,
            roles: user.roles || [],
            accessToken: token || '',
          } as ExtendedUser
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed. Please try again.')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const extendedUser = user as ExtendedUser
        token.accessToken = extendedUser.accessToken || account.access_token || ''
        token.refreshToken = account.refresh_token
        token.roles = extendedUser.roles
      }
      return token
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: token.accessToken as string || '',
        roles: (token.roles as string[]) || []
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
} 