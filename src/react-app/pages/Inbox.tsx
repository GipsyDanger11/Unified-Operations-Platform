import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import { ScrollArea } from "@/react-app/components/ui/scroll-area";
import { api } from "@/react-app/lib/api";
import { Loader2, Send, Phone, Mail, User, Search, MoreVertical, MessageSquare } from "lucide-react";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Message {
  _id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'sms';
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface Conversation {
  _id: string;
  contact: Contact;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: 'open' | 'closed' | 'archived';
  messages?: Message[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversation list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api.getConversations();
        setConversations(data);
        if (data.length > 0 && !selectedConversationId) {
          // Select first one by default if none selected
          // setSelectedConversationId(data[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch full conversation details when selected
  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchDetails = async () => {
      setMessagesLoading(true);
      try {
        const data = await api.getConversation(selectedConversationId);
        setCurrentConversation(data);
      } catch (error) {
        console.error("Failed to fetch conversation details", error);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchDetails();
  }, [selectedConversationId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    setSending(true);
    try {
      // Default to email for now, ideally channel selector
      const channel = 'email';
      await api.sendMessage(selectedConversationId, newMessage, channel);

      // Optimistic update or refetch
      const newMsg: Message = {
        _id: Date.now().toString(),
        content: newMessage,
        direction: 'outbound',
        channel,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), newMsg],
        lastMessage: newMessage,
        lastMessageAt: new Date().toISOString()
      } : null);

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] -m-6 flex overflow-hidden">
      {/* Sidebar: Conversation List */}
      <div className="w-1/3 border-r bg-white/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search messages..." className="pl-9 bg-white" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
                className={`p-4 flex items-start gap-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 ${selectedConversationId === conv._id ? "bg-purple-50 border-purple-200" : ""
                  }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {conv.contact.firstName[0]}{conv.contact.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">
                      {conv.contact.firstName} {conv.contact.lastName}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center p-0 text-[10px]">
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white/80">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {currentConversation?.contact.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {currentConversation?.contact.firstName} {currentConversation?.contact.lastName}
                  </h2>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {currentConversation?.contact.email}</span>
                    {currentConversation?.contact.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {currentConversation?.contact.phone}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex justify-center pt-10">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : (
                currentConversation?.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${msg.direction === 'outbound'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-1 block opacity-70 ${msg.direction === 'outbound' ? 'text-purple-100' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.channel}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !newMessage.trim()} className="bg-purple-600 hover:bg-purple-700">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
