import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
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
      const response = await fetch(`${strapiUrl}/api/courses/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Strapi API error:', responseData)
        return NextResponse.json(
          { 
            error: responseData.error?.message || 'Failed to publish course in Strapi',
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
    console.error('Error publishing course:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 