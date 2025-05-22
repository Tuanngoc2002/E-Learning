import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'descriptions', 'difficulty', 'price', 'organizationID']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard']
    if (!validDifficulties.includes(body.difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      )
    }

    // Validate price
    if (typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      )
    }

    // Check if Strapi API URL is configured
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
    if (!strapiUrl) {
      console.error('Strapi API URL is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Strapi API URL is not set' },
        { status: 500 }
      )
    }

    // Make request to Strapi backend
    try {
      const response = await fetch(`${strapiUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
        },
        body: JSON.stringify({
          data: {
            ...body,
            instructor: 1, // This should be replaced with the actual instructor ID from the session
          },
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Strapi API error:', responseData)
        return NextResponse.json(
          { 
            error: responseData.error?.message || 'Failed to create course in Strapi',
            details: responseData
          },
          { status: response.status }
        )
      }

      return NextResponse.json(responseData)
    } catch (strapiError) {
      console.error('Error connecting to Strapi:', strapiError)
      return NextResponse.json(
        { 
          error: 'Failed to connect to the backend service',
          details: strapiError instanceof Error ? strapiError.message : 'Unknown error'
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 