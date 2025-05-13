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
import { Button } from "@/components/ui/button";

export default function ChatBottomButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>(""); 
  const [initialMessage, setInitialMessage] = useState(true);
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
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };
    
    initializeConversation();
  }, [isOpen, user, loading, initialMessage, messages.length]);
  
  // Listen for messages
  useEffect(() => {
    if (!conversationId || !isOpen) return;
    
    const unsubscribe = listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });
    
    return () => unsubscribe();
  }, [conversationId, isOpen]);
  
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
    <>
      {/* Bottom Bar Button */}
      <Button 
        variant="ghost" 
        className="flex-1 flex flex-col items-center gap-1 h-full rounded-none relative"
        onClick={toggleChat}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-xs">Support</span>
        {messages.some(msg => !msg.read && msg.isAdmin) && (
          <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-16 left-0 right-0 z-50 mx-2 mb-2 rounded-t-xl shadow-xl",
            "bg-card border border-border overflow-hidden",
            "flex flex-col h-[70vh] max-h-[500px]",
          )}
        >
          {/* Chat Header */}
          <div className="bg-primary p-3 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm">TradeSphere Support</h3>
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
    </>
  );
}
