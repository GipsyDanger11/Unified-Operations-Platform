import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/react-app/components/ui/avatar";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import { ScrollArea } from "@/react-app/components/ui/scroll-area";
import { api } from "@/react-app/lib/api";
import { Loader2, Send, Phone, Mail, Search, MoreVertical, MessageSquare } from "lucide-react";

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
  sender: 'contact' | 'staff' | 'system';
  channel: 'email' | 'sms' | 'internal';
  createdAt?: string;
  sentAt?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
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
        const response = await api.getConversations();
        setConversations(Array.isArray(response.conversations) ? response.conversations : []);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
        setConversations([]);
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
        setCurrentConversation(data.conversation);
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
      const channel = 'email';
      await api.sendMessage(selectedConversationId, newMessage, channel);

      const newMsg: Message = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: 'staff',
        channel,
        sentAt: new Date().toISOString(),
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

  // Handle URL query for conversation selection
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const convId = searchParams.get("conversationId");
    if (convId) {
      setSelectedConversationId(convId);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-white">
      {/* Sidebar: Conversation List */}
      <div className="w-80 md:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 space-y-1">
            {conversations.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500 mt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">New inquiries from your forms and bookings will appear here.</p>
              </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
                className={`p-3 rounded-xl flex items-start gap-3 transition-all text-left group ${selectedConversationId === conv._id
                  ? "bg-purple-600 shadow-md shadow-purple-200"
                  : "hover:bg-white hover:shadow-sm"
                  }`}
              >
                <Avatar className="border-2 border-white shadow-sm">
                  <AvatarFallback className={`${selectedConversationId === conv._id
                    ? "bg-purple-500 text-white border-purple-400"
                    : "bg-purple-100 text-purple-700"
                    }`}>
                    {conv.contact?.firstName?.[0] || "?"}{conv.contact?.lastName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className={`font-semibold truncate ${selectedConversationId === conv._id ? "text-white" : "text-gray-900"
                      }`}>
                      {conv.contact?.firstName || "Unknown"} {conv.contact?.lastName || "Contact"}
                    </span>
                    {conv.lastMessageAt && (
                      <span className={`text-[10px] whitespace-nowrap ml-2 ${selectedConversationId === conv._id ? "text-purple-200" : "text-gray-400"
                        }`}>
                        {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${selectedConversationId === conv._id ? "text-purple-100" : "text-gray-500"
                    }`}>
                    {conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : "No messages yet")}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className={`rounded-full w-5 h-5 flex items-center justify-center p-0 text-[10px] border-0 ${selectedConversationId === conv._id ? "bg-white text-purple-600" : "bg-purple-600 text-white"
                    }`}>
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-gray-100">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    {currentConversation?.contact?.firstName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {currentConversation?.contact?.firstName || "Unknown"} {currentConversation?.contact?.lastName || "Contact"}
                  </h2>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" /> {currentConversation?.contact?.email || "No email"}
                    </span>
                    {currentConversation?.contact?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400" /> {currentConversation?.contact?.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-600">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex justify-center pt-20">
                  <div className="flex items-center gap-2 text-purple-600 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading conversation...
                  </div>
                </div>
              ) : (
                currentConversation?.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group relative ${msg.sender === 'staff' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-2xl p-4 shadow-sm border ${msg.sender === 'staff'
                          ? 'bg-purple-600 text-white border-purple-500 rounded-tr-sm'
                          : 'bg-white text-gray-800 border-gray-100 rounded-tl-sm'
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] mt-1.5 px-1 font-medium text-gray-400`}>
                        {new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === 'staff' && (
                          <span className="ml-1 opacity-70">• {msg.status || 'sent'}</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-3 py-2 min-h-[44px]"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="rounded-xl h-10 w-10 p-0 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                  </Button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-gray-400">Press Enter to send • Shift + Enter for new line</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-500/5 border border-purple-50 animate-pulse">
              <MessageSquare className="w-12 h-12 text-purple-200" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-500 max-w-xs text-center">Choose a contact from the sidebar to view history or start a new message.</p>
          </div>
        )}
      </div>
    </div>
  );
}
