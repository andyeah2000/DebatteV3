import { NextRequest, NextResponse } from 'next/server'
import { createYoga } from 'graphql-yoga'
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
  fetchAPI: { Response: NextResponse },
  graphqlEndpoint: '/api/graphql',
  context: createContext,
  landingPage: false,
  graphiql: process.env.NODE_ENV === 'development'
})

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const response = await handleRequest(request, { req: request, res: new NextResponse() })
  return response
}

export async function GET(request: NextRequest) {
  const response = await handleRequest(request, { req: request, res: new NextResponse() })
  return response
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