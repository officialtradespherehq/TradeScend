"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";
import { 
  getOrCreateConversation, 
  sendMessage, 
  listenToMessages, 
  markMessagesAsRead,
  ChatMessage
} from "@/lib/chat-service";
import { cn } from "@/lib/utils";

export default function ChatNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>(""); 
  const [initialMessage, setInitialMessage] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading } = useAuth();
  
  // Initialize conversation when user opens chat
  useEffect(() => {
    if (!isOpen || loading || !user) return;
    
    const initializeConversation = async () => {
      try {
        // Get or create a conversation for this user
        const convId = await getOrCreateConversation(user.uid, user.name || user.email || 'User');
        setConversationId(convId);
        
        // Add welcome message if this is a new conversation
        if (initialMessage && messages.length === 0) {
          await sendMessage(
            convId,
            "👋 Hi there! How can I help you today?",
            'admin',
            'Support Team',
            true
          );
          setInitialMessage(false);
        }
        
        // Mark messages as read
        await markMessagesAsRead(convId, false);
        setUnreadCount(0);
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };
    
    initializeConversation();
  }, [isOpen, user, loading, initialMessage, messages.length]);
  
  // Listen for messages and count unread ones
  useEffect(() => {
    if (!user || loading) return;
    
    // First get the conversation ID if we don't have it yet
    const getConversation = async () => {
      try {
        const convId = await getOrCreateConversation(user.uid, user.name || user.email || 'User');
        setConversationId(convId);
        
        // Now listen for messages
        const unsubscribe = listenToMessages(convId, (newMessages) => {
          setMessages(newMessages);
          
          // Count unread admin messages
          if (!isOpen) {
            const unread = newMessages.filter(msg => msg.isAdmin && !msg.read).length;
            setUnreadCount(unread);
          } else {
            // If chat is open, mark messages as read
            markMessagesAsRead(convId, false).catch(console.error);
            setUnreadCount(0);
          }
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error getting conversation:", error);
        return () => {};
      }
    };
    
    const unsubscribePromise = getConversation();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, [user, loading, isOpen]);
  
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !conversationId) return;

    try {
      // Send message to Firestore
      await sendMessage(
        conversationId,
        message,
        user.uid,
        user.name || user.email || 'User',
        false
      );
      
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Helper function to format timestamps
  const formatTimestamp = (timestamp: Date | Timestamp): string => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const chatMessages = document.querySelector(".chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-white hover:bg-primary/90",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
        aria-label="Open support chat"
      >
        <MessageSquare className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-20 right-4 z-50 rounded-lg shadow-xl",
            "bg-card border border-border overflow-hidden",
            "flex flex-col w-80 h-96",
            "animate-in slide-in-from-bottom duration-300"
          )}
        >
          {/* Chat Header */}
          <div className="bg-primary p-3 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm">TradeScend Support</h3>
                <p className="text-xs text-white/80">We typically reply within minutes</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white/80 hover:text-white p-1" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={cn("flex", !msg.isAdmin ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    !msg.isAdmin ? "bg-primary text-white rounded-br-none" : "bg-muted text-foreground rounded-bl-none",
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={cn(
                  "p-2 rounded-md",
                  message.trim()
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
