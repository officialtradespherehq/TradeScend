// Client-side notification service that uses the API route

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

// Main function to send email notification
const sendNotification = async (type: NotificationType, data: NotificationData) => {
  try {
    await callNotificationApi(type, data);
    console.log(`Email notification sent for ${type}`);
    return true;
  } catch (err: any) {
    console.error('Error sending email notification:', err);
    return false;
  }
};

// Specific notification functions for each event type
export const notifyRegistration = async (data: NotificationData) => {
  return sendNotification('registration', data);
};

export const notifyKycSubmission = async (data: NotificationData) => {
  return sendNotification('kyc', data);
};

export const notifyInvestment = async (data: NotificationData) => {
  return sendNotification('investment', data);
};

export const notifyWithdrawal = async (data: NotificationData) => {
  return sendNotification('withdrawal', data);
};

export const notifySupportMessage = async (data: NotificationData) => {
  return sendNotification('support', data);
};
