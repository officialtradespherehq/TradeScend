import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';

// Helper function to create a response with cookies
const createResponseWithCookies = (data: any, status: number = 200) => {
  const response = NextResponse.json(data, { status });
  return response;
};

// Helper function to add a cookie to a response
const addCookie = (response: NextResponse, name: string, value: string, options: any) => {
  response.cookies.set({
    name,
    value,
    ...options
  });
  return response;
};

// POST handler for setting auth cookies
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // Create response with cookies
    const response = createResponseWithCookies({ success: true });
    
    // Add session cookie
    addCookie(response, 'session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds for HTTP cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    // Add isAdmin cookie
    addCookie(response, 'isAdmin', decodedToken.admin === true ? 'true' : 'false', {
      maxAge: expiresIn / 1000, // Convert to seconds for HTTP cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error setting session:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// DELETE handler for clearing auth cookies
export async function DELETE() {
  try {
    // Create response with cleared cookies
    const response = createResponseWithCookies({ success: true });
    
    // Clear cookies by setting them to expire immediately
    addCookie(response, 'session', '', {
      maxAge: 0,
      path: '/',
    });
    
    addCookie(response, 'isAdmin', '', {
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
