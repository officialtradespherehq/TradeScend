import { NextRequest, NextResponse } from 'next/server';
import { auth, app } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

const db = getFirestore(app);

// Generate a secret and QR code for 2FA setup
export async function POST(request: NextRequest) {
  try {
    const { action, uid, code } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify the user exists
    try {
      await auth.getUser(uid);
    } catch (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRef = db.collection('Users').doc(uid);

    if (action === 'generate') {
      // Generate a new secret
      const secret = generateSecret();
      const serviceName = 'TradeScend';
      const accountName = (await userRef.get()).data()?.email || 'user';
      
      // Create the OTP Auth URL
      const otpAuthUrl = generateURI({
        secret,
        label: accountName,
        issuer: serviceName,
      });
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
      
      // Store the secret temporarily (not enabled yet)
      await userRef.update({
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      });
      
      return NextResponse.json({
        secret,
        qrCode: qrCodeDataUrl,
        manualEntryKey: secret,
      });
    }

    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      if (!userData?.twoFactorSecret) {
        return NextResponse.json({ error: 'No 2FA secret found. Please generate one first.' }, { status: 400 });
      }

      // Verify the code
      const result = verifySync({
        token: code,
        secret: userData.twoFactorSecret,
      });

      // verifySync returns a VerifyResult object with a 'valid' property
      if (result.valid === true) {
        // Enable 2FA
        await userRef.update({
          twoFactorEnabled: true,
        });
        
        return NextResponse.json({ success: true, message: '2FA enabled successfully' });
      } else {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }
    }

    if (action === 'verify-login') {
      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      if (!userData?.twoFactorSecret) {
        return NextResponse.json({ error: 'No 2FA secret found.' }, { status: 400 });
      }

      if (!userData?.twoFactorEnabled) {
        return NextResponse.json({ error: '2FA is not enabled for this account.' }, { status: 400 });
      }

      // Verify the code (for login, we just verify without enabling)
      const result = verifySync({
        token: code,
        secret: userData.twoFactorSecret,
      });

      // verifySync returns a VerifyResult object with a 'valid' property
      if (result.valid === true) {
        return NextResponse.json({ success: true, message: '2FA verification successful' });
      } else {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }
    }

    if (action === 'disable') {
      await userRef.update({
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });
      
      return NextResponse.json({ success: true, message: '2FA disabled successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in 2FA route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET handler to check 2FA status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDoc = await db.collection('Users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      twoFactorEnabled: userData?.twoFactorEnabled || false,
      hasSecret: !!userData?.twoFactorSecret,
    });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
