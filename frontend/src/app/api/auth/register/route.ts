import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Username validation
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { message: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8 || password.length > 50) {
      return NextResponse.json(
        { message: 'Password must be between 8 and 50 characters' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateUser($createUserInput: CreateUserInput!) {
              createUser(createUserInput: $createUserInput) {
                id
                email
                username
              }
            }
          `,
          variables: {
            createUserInput: {
              username,
              email,
              password,
            },
          },
        }),
      }
    )

    const data = await response.json()

    if (data.errors) {
      const error = data.errors[0]
      // Handle specific error cases
      if (error.message.includes('duplicate key')) {
        if (error.message.includes('email')) {
          return NextResponse.json(
            { message: 'Email already registered' },
            { status: 400 }
          )
        }
        if (error.message.includes('username')) {
          return NextResponse.json(
            { message: 'Username already taken' },
            { status: 400 }
          )
        }
      }
      
      // Handle validation errors
      if (error.message.includes('validation failed')) {
        const validationMessage = error.message.split(':')[1]?.trim() || error.message
        return NextResponse.json(
          { message: validationMessage },
          { status: 400 }
        )
      }
      
      // Generic error
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: 400 }
      )
    }

    if (!data.data?.createUser) {
      return NextResponse.json(
        { message: 'Registration failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(data.data.createUser)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 