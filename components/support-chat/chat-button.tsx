"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageSquare, X, Send, ChevronDown } from "lucide-react"
import { gsap } from "gsap"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Timestamp } from "firebase/firestore"
import { 
  getOrCreateConversation, 
  sendMessage, 
  listenToMessages, 
  markMessagesAsRead,
  ChatMessage
} from "@/lib/chat-service"

export default function SupportChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>("") 
  const [initialMessage, setInitialMessage] = useState(true)
  const { theme } = useTheme()
  const { user, loading } = useAuth()

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
  }

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
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // Helper function to format timestamps
  const formatTimestamp = (timestamp: Date | Timestamp): string => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Animate the button entrance
  useEffect(() => {
    const button = document.querySelector(".chat-button")
    if (button) {
      gsap.fromTo(
        button,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 1 },
      )
    }
  }, [])

  // Animate chat window open/close
  useEffect(() => {
    const chatWindow = document.querySelector(".chat-window")
    if (chatWindow) {
      if (isOpen) {
        gsap.fromTo(
          chatWindow,
          { y: 20, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
        )
      } else {
        gsap.to(chatWindow, { y: 20, opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in" })
      }
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const chatMessages = document.querySelector(".chat-messages")
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }, [messages])

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "chat-button fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-white",
          "hover:scale-105 active:scale-95",
        )}
        aria-label="Open support chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "chat-window fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] rounded-xl shadow-xl",
            "bg-card border border-border overflow-hidden",
            "flex flex-col max-h-[80vh] md:max-h-[600px]",
          )}
        >
          {/* Chat Header */}
          <div className="bg-primary p-3 md:p-4 text-white flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">TradeSphere Support</h3>
                <p className="text-xs text-white/80">We typically reply within minutes</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white/80 hover:text-white" aria-label="Minimize chat">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages flex-1 p-3 md:p-4 overflow-y-auto space-y-3 md:space-y-4">
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
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg rounded-bl-none p-3">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-2 md:p-3">
            <div className="flex items-center gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-background border border-border rounded-md px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={1}
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
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Our support team is available 24/7 to assist you
            </p>
          </div>
        </div>
      )}
    </>
  )
}
