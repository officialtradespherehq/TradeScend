import { useState } from 'react';

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

export function useMailNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to call the notification API
  const callNotificationApi = async (type: NotificationType, data: NotificationData) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }
      
      return true;
    } catch (error) {
      console.error('Error calling notification API:', error);
      throw error;
    }
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
              <li><strong>Registration Time:</strong> ${new Date().toLocaleString()}</li>
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
              <li><strong>Submission Time:</strong> ${new Date().toLocaleString()}</li>
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
              <li><strong>Investment Time:</strong> ${new Date().toLocaleString()}</li>
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
              <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
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
              <li><strong>Message Time:</strong> ${new Date().toLocaleString()}</li>
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
    setLoading(true);
    setError(null);
    
    try {
      await callNotificationApi(type, data);
      console.log(`Email notification sent for ${type}`);
      return true;
    } catch (err: any) {
      console.error('Error sending email notification:', err);
      setError(err.message || 'Failed to send email notification');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Specific notification functions for each event type
  const notifyRegistration = async (data: NotificationData) => {
    return sendNotification('registration', data);
  };

  const notifyKycSubmission = async (data: NotificationData) => {
    return sendNotification('kyc', data);
  };

  const notifyInvestment = async (data: NotificationData) => {
    return sendNotification('investment', data);
  };

  const notifyWithdrawal = async (data: NotificationData) => {
    return sendNotification('withdrawal', data);
  };

  const notifySupportMessage = async (data: NotificationData) => {
    return sendNotification('support', data);
  };

  return {
    loading,
    error,
    notifyRegistration,
    notifyKycSubmission,
    notifyInvestment,
    notifyWithdrawal,
    notifySupportMessage,
  };
}
