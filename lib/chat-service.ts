import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";

export interface ChatMessage {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  timestamp: Timestamp | Date;
  read: boolean;
  conversationId: string;
}

export interface ChatConversation {
  id?: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Timestamp | Date;
  unreadCount: number;
  status: 'open' | 'closed';
}

// Create a new conversation
export const createConversation = async (userId: string, userName: string): Promise<string> => {
  try {
    const conversationRef = await addDoc(collection(db, "chatConversations"), {
      userId,
      userName,
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      status: 'open'
    });
    return conversationRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get or create a conversation for a user
export const getOrCreateConversation = async (userId: string, userName: string): Promise<string> => {
  try {
    // Check if user already has a conversation
    const q = query(
      collection(db, "chatConversations"),
      where("userId", "==", userId),
      where("status", "==", "open")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return existing conversation
      return querySnapshot.docs[0].id;
    } else {
      // Create new conversation
      return await createConversation(userId, userName);
    }
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  text: string,
  userId: string,
  userName: string,
  isAdmin: boolean
): Promise<void> => {
  try {
    // Check if this is the first message from the user in this conversation
    let isFirstMessage = false;
    if (!isAdmin) {
      const messagesQuery = query(
        collection(db, "chatMessages"),
        where("conversationId", "==", conversationId),
        where("userId", "==", userId),
        where("isAdmin", "==", false)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      isFirstMessage = messagesSnapshot.empty;
    }
    
    // Add message to messages collection
    await addDoc(collection(db, "chatMessages"), {
      conversationId,
      text,
      userId,
      userName,
      isAdmin,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update conversation with last message
    const conversationRef = doc(db, "chatConversations", conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unreadCount: isAdmin ? 0 : 1, // Increment unread count if message is from user
      status: 'open'
    });
    
    // Send email notification if this is the first message from the user
    if (isFirstMessage && !isAdmin) {
      try {
        // Get user email from Users collection
        const userDoc = await getDoc(doc(db, "Users", userId));
        let userEmail = null;
        if (userDoc.exists()) {
          userEmail = userDoc.data().email;
        }
        
        // Send email notification using the API route
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'support',
              data: {
                userName,
                userEmail: userEmail || undefined,
                userId,
                message: text
              }
            }),
          });
        } catch (apiError) {
          console.error('Failed to call notification API:', apiError);
          // Continue even if notification fails
        }
        console.log("Support message notification sent successfully");
      } catch (notificationError) {
        console.error("Failed to send support message notification:", notificationError);
        // Continue with message sending even if notification fails
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Listen to messages for a conversation
export const listenToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const q = query(
    collection(db, "chatMessages"),
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "asc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as ChatMessage);
    });
    callback(messages);
  });
};

// Listen to all conversations (for admin)
export const listenToConversations = (
  callback: (conversations: ChatConversation[]) => void
) => {
  const q = query(
    collection(db, "chatConversations"),
    where("status", "==", "open"),
    orderBy("lastMessageTime", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const conversations: ChatConversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      } as ChatConversation);
    });
    callback(conversations);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, isAdmin: boolean): Promise<void> => {
  try {
    // Get all unread messages from the other party
    const q = query(
      collection(db, "chatMessages"),
      where("conversationId", "==", conversationId),
      where("isAdmin", "==", !isAdmin), // Messages from the other party
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Mark each message as read
    const batch: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
      const messageRef = doc(db, "chatMessages", document.id);
      batch.push(updateDoc(messageRef, { read: true }));
    });
    
    await Promise.all(batch);
    
    // Reset unread count in conversation
    if (isAdmin) {
      const conversationRef = doc(db, "chatConversations", conversationId);
      await updateDoc(conversationRef, { unreadCount: 0 });
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
