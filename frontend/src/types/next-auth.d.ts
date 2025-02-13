import 'next-auth'
import { JWT } from 'next-auth/jwt'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      roles: string[]
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    roles: string[]
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    picture?: string
    roles: string[]
    accessToken: string
  }
} 