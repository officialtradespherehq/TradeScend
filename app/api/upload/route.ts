import { NextRequest, NextResponse } from 'next/server';

// This is a workaround for using Cloudinary in Next.js API routes
// We're using the Cloudinary URL directly instead of the Node.js SDK
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const folder = 'TradeScend'; // Always use TradeScend folder
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }

    // Create a Cloudinary upload URL
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    // Create a new FormData to send to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'ml_default'); // Use the default unsigned upload preset in Cloudinary dashboard
    cloudinaryFormData.append('folder', folder); // Use TradeScend folder
    
    // Make the request to Cloudinary
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error:', errorText);
      return NextResponse.json(
        { error: 'Upload to Cloudinary failed' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

// Increase payload size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

