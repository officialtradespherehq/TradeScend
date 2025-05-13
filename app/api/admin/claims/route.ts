import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

// POST handler for setting admin claims
export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Set admin claim for the user
    await auth.setCustomUserClaims(uid, { admin: true });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler for removing admin claims
export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Remove admin claim for the user
    await auth.setCustomUserClaims(uid, { admin: false });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing admin claim:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
