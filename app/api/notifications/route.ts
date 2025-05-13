import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type NotificationType = 
  | 'registration' 
  | 'kyc' 
  | 'investment' 
  | 'withdrawal' 
  | 'support';

type NotificationData = {
  userEmail?: string;
  userName?: string;
  userId?: string;
  amount?: number;
  walletAddress?: string;
  coin?: string;
  investmentPlan?: string;
  message?: string;
  kycData?: any;
};

// Create a reusable transporter object using Zeptomail API
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ZEPTOMAIL_SENDER_EMAIL,
      pass: process.env.ZEPTOMAIL_API_KEY,
    },
  });

  return transporter;
};

// Helper function to get email subject and body based on notification type
const getEmailContent = (type: NotificationType, data: NotificationData) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const senderName = process.env.ZEPTOMAIL_SENDER_NAME || 'TradeScend';
  
  switch (type) {
    case 'registration':
      return {
        to: adminEmail,
        subject: `New User Registration - ${data.userName}`,
        html: `
          <h2>New User Registration</h2>
          <p>A new user has registered on the TradeScend platform.</p>
          <ul>
            <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
            <li><strong>Email:</strong> ${data.userEmail || 'N/A'}</li>
            <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
            <li><strong>Registration Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please review the new account in the admin dashboard.</p>
        `,
      };
    
    case 'kyc':
      return {
        to: adminEmail,
        subject: `New KYC Submission - ${data.userName}`,
        html: `
          <h2>New KYC Submission</h2>
          <p>A user has submitted KYC verification documents.</p>
          <ul>
            <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
            <li><strong>Email:</strong> ${data.userEmail || 'N/A'}</li>
            <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
            <li><strong>Submission Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please review the KYC documents in the admin dashboard.</p>
        `,
      };
    
    case 'investment':
      return {
        to: adminEmail,
        subject: `New Investment - ${data.userName}`,
        html: `
          <h2>New Investment</h2>
          <p>A user has made a new investment.</p>
          <ul>
            <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
            <li><strong>Email:</strong> ${data.userEmail || 'N/A'}</li>
            <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
            <li><strong>Amount:</strong> $${data.amount?.toFixed(2) || 'N/A'}</li>
            <li><strong>Investment Plan:</strong> ${data.investmentPlan || 'N/A'}</li>
            <li><strong>Investment Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please review the investment in the admin dashboard.</p>
        `,
      };
    
    case 'withdrawal':
      return {
        to: adminEmail,
        subject: `New Withdrawal Request - ${data.userName}`,
        html: `
          <h2>New Withdrawal Request</h2>
          <p>A user has requested a withdrawal.</p>
          <ul>
            <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
            <li><strong>Email:</strong> ${data.userEmail || 'N/A'}</li>
            <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
            <li><strong>Amount:</strong> $${data.amount?.toFixed(2) || 'N/A'}</li>
            <li><strong>Wallet Address:</strong> ${data.walletAddress || 'N/A'}</li>
            <li><strong>Coin:</strong> ${data.coin || 'N/A'}</li>
            <li><strong>Request Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please process this withdrawal request in the admin dashboard.</p>
        `,
      };
    
    case 'support':
      return {
        to: adminEmail,
        subject: `New Support Message - ${data.userName}`,
        html: `
          <h2>New Support Message</h2>
          <p>A user has sent their first support message.</p>
          <ul>
            <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
            <li><strong>Email:</strong> ${data.userEmail || 'N/A'}</li>
            <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
            <li><strong>Message:</strong> "${data.message || 'N/A'}"</li>
            <li><strong>Message Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please respond to this support request in the admin dashboard.</p>
        `,
      };
    
    default:
      return {
        to: adminEmail,
        subject: `TradeScend Notification`,
        html: `<p>A notification was triggered but the type was not recognized.</p>`,
      };
  }
};

// Main function to send email notification
const sendNotification = async (type: NotificationType, data: NotificationData) => {
  try {
    const transporter = createTransporter();
    const emailContent = getEmailContent(type, data);
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${process.env.ZEPTOMAIL_SENDER_NAME}" <${process.env.ZEPTOMAIL_SENDER_EMAIL}>`,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`Email notification sent: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error('Error sending email notification:', err);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      );
    }
    
    const result = await sendNotification(type as NotificationType, data);
    
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notification API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
