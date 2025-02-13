import { NextRequest, NextResponse } from 'next/server'
import { createYoga } from 'graphql-yoga'
import { createSchema } from '@graphql-tools/schema'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@/graphql/schema'
import { resolvers } from '@/graphql/resolvers'
import { createContext } from '@/graphql/context'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const { handleRequest } = createYoga({
  schema,
  // Yoga needs to know how to create a valid Response object
  fetchAPI: { Response: NextResponse },
  graphqlEndpoint: '/api/graphql',
  context: createContext,
})

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

// Enable CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    }
  })
  return response
} 