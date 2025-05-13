"use client";

import { useState, useEffect } from "react";
import { 
  listenToConversations, 
  listenToMessages, 
  sendMessage, 
  markMessagesAsRead,
  ChatConversation,
  ChatMessage
} from "@/lib/chat-service";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, User, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();

  // Listen for all conversations
  useEffect(() => {
    const unsubscribe = listenToConversations((newConversations) => {
      setConversations(newConversations);
    });

    return () => unsubscribe();
  }, []);

  // Listen for messages in the selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = listenToMessages(selectedConversation, (newMessages) => {
      setMessages(newMessages);
    });

    // Mark messages as read when admin views them
    markMessagesAsRead(selectedConversation, true).catch(error => {
      console.error("Error marking messages as read:", error);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date | Timestamp): string => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    return new Date().toLocaleString();
  };

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp: Date | Timestamp): string => {
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp && typeof timestamp.toDate === 'function'
        ? timestamp.toDate()
        : new Date();
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return formatTimestamp(timestamp);
  };

  // Send a reply to the user
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage(
        selectedConversation,
        replyText,
        user.uid,
        "Support Team",
        true
      );
      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const chatMessages = document.querySelector(".admin-chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]);

  // State to control mobile view
  const [showConversations, setShowConversations] = useState(true);
  
  // Toggle between conversations and chat on mobile
  const toggleMobileView = () => {
    setShowConversations(!showConversations);
  };

  // Determine if we're on mobile based on selected conversation
  useEffect(() => {
    if (selectedConversation && window.innerWidth < 768) {
      setShowConversations(false);
    }
  }, [selectedConversation]);

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Customer Support</h1>
      
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={toggleMobileView}
          className="w-full flex items-center justify-center gap-2"
        >
          {showConversations ? (
            <>
              <MessageSquare className="h-4 w-4" />
              <span>Viewing Conversations</span>
              {selectedConversation && <span className="ml-2">(1 selected)</span>}
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>Back to Conversations</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Conversations List - Hidden on mobile when chat is active */}
        <Card className={`md:col-span-1 ${!showConversations ? 'hidden md:block' : ''}`}>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Conversations</span>
              {conversations.length > 0 && (
                <span className="text-xs sm:text-sm bg-primary text-white rounded-full px-2 py-0.5 ml-2">
                  {conversations.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-2">
            {conversations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 sm:py-8 text-sm">No active conversations</p>
            ) : (
              <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg cursor-pointer transition-colors text-sm",
                      selectedConversation === conversation.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted",
                      conversation.unreadCount > 0 && selectedConversation !== conversation.id && "border-l-4 border-primary"
                    )}
                    onClick={() => {
                      setSelectedConversation(conversation.id || null);
                      if (window.innerWidth < 768) {
                        setShowConversations(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{conversation.userName}</span>
                      </div>
                      {conversation.unreadCount > 0 && selectedConversation !== conversation.id && (
                        <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm truncate">{conversation.lastMessage}</div>
                    <div className="mt-1 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(conversation.lastMessageTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area - Hidden on mobile when conversations are shown */}
        <Card className={`md:col-span-2 ${showConversations ? 'hidden md:block' : ''}`}>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedConversation 
                  ? `Chat with ${conversations.find(c => c.id === selectedConversation)?.userName || 'User'}`
                  : "Select a conversation"}
              </div>
              {/* Mobile back button */}
              {selectedConversation && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden" 
                  onClick={() => setShowConversations(true)}
                >
                  <span className="sr-only">Back</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-2">
            {!selectedConversation ? (
              <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] text-center">
                <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-muted-foreground text-sm">Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="admin-chat-messages h-[300px] sm:h-[400px] overflow-y-auto mb-3 sm:mb-4 space-y-2 sm:space-y-3 p-2">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm">No messages yet</p>
                  ) : (
                    messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex",
                          msg.isAdmin ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[90%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 text-sm",
                            msg.isAdmin 
                              ? "bg-primary text-white rounded-br-none" 
                              : "bg-muted text-foreground rounded-bl-none"
                          )}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {msg.isAdmin ? "Support Team" : msg.userName}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm break-words">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] sm:text-xs opacity-70">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                            {msg.read && <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 opacity-70" />}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input */}
                <div className="flex gap-1 sm:gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply..."
                    className="flex-1 text-sm h-9 sm:h-10"
                  />
                  <Button 
                    onClick={handleSendReply} 
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Reply</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
