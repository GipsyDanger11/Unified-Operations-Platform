import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Avatar, AvatarFallback } from "@/react-app/components/ui/avatar";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Card } from "@/react-app/components/ui/card";
import { Loader2, Send, MessageSquare } from "lucide-react";
import WaveBackground from "@/react-app/components/WaveBackground";

interface Message {
    sender: 'contact' | 'staff' | 'system';
    content: string;
    sentAt: string;
}

interface Conversation {
    _id: string;
    workspace: {
        businessName: string;
    };
    contact: {
        firstName: string;
        lastName: string;
    };
    messages: Message[];
}

export default function PublicConversationPage() {
    const { id } = useParams();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/public/conversation/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setConversation(data.conversation);
                }
            } catch (err) {
                console.error("Failed to fetch conversation");
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();

        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchConversation, 10000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation?.messages]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !id) return;

        setSending(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/public/conversation/${id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: reply }),
            });

            if (response.ok) {
                // Optimistic update
                const newMsg: Message = {
                    sender: 'contact',
                    content: reply,
                    sentAt: new Date().toISOString(),
                };
                setConversation(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, newMsg]
                } : null);
                setReply("");
            }
        } catch (err) {
            console.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="h-screen w-full flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Conversation not found</h2>
                    <p className="text-gray-500">The link might be expired or incorrect.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-50 relative overflow-hidden flex flex-col">
            <WaveBackground />

            {/* Header */}
            <div className="relative z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 p-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-purple-100">
                        <AvatarFallback className="bg-purple-600 text-white">
                            {conversation.workspace.businessName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold text-purple-900">{conversation.workspace.businessName}</h1>
                        <p className="text-xs text-purple-600">Secure Chat</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto relative z-10 p-4" ref={scrollRef}>
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="text-center py-8">
                        <p className="text-xs text-gray-400 bg-white/50 inline-block px-3 py-1 rounded-full border border-gray-100">
                            This is a secure message from {conversation.workspace.businessName}
                        </p>
                    </div>

                    {conversation.messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === 'contact' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] ${msg.sender === 'contact' ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div
                                    className={`rounded-2xl p-4 shadow-sm ${msg.sender === 'contact'
                                        ? 'bg-purple-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 border border-purple-50 rounded-tl-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="relative z-10 bg-white border-t border-purple-100 p-4 pb-8">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSendReply} className="flex gap-2 items-center">
                        <Input
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 bg-gray-50 border-gray-200 focus:bg-white focus:ring-purple-500"
                            disabled={sending}
                        />
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 h-10 w-10 p-0 rounded-full shadow-lg shadow-purple-200"
                            disabled={sending || !reply.trim()}
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                    <p className="text-[10px] text-center text-gray-400 mt-3">
                        Your messages are sent directly to the team at {conversation.workspace.businessName}.
                    </p>
                </div>
            </div>
        </div>
    );
}
