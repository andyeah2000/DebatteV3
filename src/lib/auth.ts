import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/graphql`, {
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
            roles: user.roles,
            accessToken: token,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.roles = user.roles
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
        session.user.roles = token.roles
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
} 