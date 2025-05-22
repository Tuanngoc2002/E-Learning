import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real application, you would fetch the user data from a database
    // For now, we'll return the data from cookies
    const userName = cookieStore.get('userName')?.value || '';
    const userEmail = cookieStore.get('email')?.value || '';
    const userRole = cookieStore.get('userRole')?.value || '';
    
    return NextResponse.json({
      id: userId,
      username: userName,
      email: userEmail,
      role: userRole,
      avatar: '', // This would come from a database in a real app
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { username, email, avatar } = data;
    
    // In a real application, you would update the user data in a database
    // For now, we'll just update the cookies
    
    // Update cookies with new data
    if (username) {
      cookies().set('userName', username, { path: '/' });
    }
    
    if (email) {
      cookies().set('email', email, { path: '/' });
    }
    
    // In a real application, you would save the avatar URL to a database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        username: username || cookieStore.get('userName')?.value || '',
        email: email || cookieStore.get('email')?.value || '',
        role: cookieStore.get('userRole')?.value || '',
        avatar: avatar || '',
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 