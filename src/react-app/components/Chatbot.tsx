import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Volume2, VolumeX } from "lucide-react";
import { api } from "@/react-app/lib/api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "👋 Hi! I'm your platform assistant. Ask me anything about navigating the dashboard, managing bookings, services, or any feature!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSpeak = (text: string, index: number) => {
        if (speakingIndex === index) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        setSpeakingIndex(index);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage: Message = { role: "user", content: trimmed };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            // Send only the conversation history (excluding the initial greeting)
            const apiMessages = updatedMessages
                .filter((_, i) => i > 0 || updatedMessages[0].role === "user")
                .map((m) => ({ role: m.role, content: m.content }));

            const data = await api.sendChatMessage(apiMessages);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Panel */}
            <div
                style={{
                    position: "fixed",
                    bottom: isOpen ? "24px" : "-600px",
                    right: "24px",
                    width: "400px",
                    maxWidth: "calc(100vw - 48px)",
                    height: "520px",
                    maxHeight: "calc(100vh - 100px)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(88, 28, 135, 0.25), 0 8px 24px rgba(0,0,0,0.15)",
                    background: "#ffffff",
                    border: "1px solid rgba(168, 85, 247, 0.15)",
                    transition: "bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                    opacity: isOpen ? 1 : 0,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Bot size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                                Platform Assistant
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px" }}>
                                Powered by Mistral AI
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                        }
                    >
                        <X size={18} color="white" />
                    </button>
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        background: "#faf5ff",
                    }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "flex-start",
                                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                            }}
                        >
                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background:
                                        msg.role === "assistant"
                                            ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                                            : "#e9d5ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                {msg.role === "assistant" ? (
                                    <Bot size={14} color="white" />
                                ) : (
                                    <User size={14} color="#7c3aed" />
                                )}
                            </div>
                            <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: "4px" }}>
                                <div
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius:
                                            msg.role === "user"
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                        background:
                                            msg.role === "user"
                                                ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                                                : "white",
                                        color: msg.role === "user" ? "white" : "#1e1b4b",
                                        fontSize: "13.5px",
                                        lineHeight: "1.5",
                                        boxShadow:
                                            msg.role === "assistant"
                                                ? "0 1px 3px rgba(0,0,0,0.08)"
                                                : "none",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word" as const,
                                    }}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === "assistant" && (
                                    <button
                                        onClick={() => handleSpeak(msg.content, i)}
                                        title={speakingIndex === i ? "Stop reading" : "Read aloud"}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "2px 4px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            color: speakingIndex === i ? "#9333ea" : "#a78bfa",
                                            fontSize: "11px",
                                            alignSelf: "flex-start",
                                            transition: "color 0.2s",
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.color = "#7c3aed")}
                                        onMouseOut={(e) => (e.currentTarget.style.color = speakingIndex === i ? "#9333ea" : "#a78bfa")}
                                    >
                                        {speakingIndex === i ? (
                                            <><VolumeX size={12} /> Stop</>
                                        ) : (
                                            <><Volume2 size={12} /> Read aloud</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Bot size={14} color="white" />
                            </div>
                            <div
                                style={{
                                    background: "white",
                                    padding: "10px 14px",
                                    borderRadius: "16px 16px 16px 4px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#7c3aed",
                                    fontSize: "13px",
                                }}
                            >
                                <Loader2 size={14} className="animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                    style={{
                        padding: "12px 16px",
                        borderTop: "1px solid #f3e8ff",
                        display: "flex",
                        gap: "8px",
                        background: "white",
                        flexShrink: 0,
                    }}
                >
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        disabled={loading}
                        style={{
                            flex: 1,
                            border: "1px solid #e9d5ff",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            fontSize: "13.5px",
                            outline: "none",
                            background: "#faf5ff",
                            color: "#1e1b4b",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                        onBlur={(e) => (e.target.style.borderColor = "#e9d5ff")}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            border: "none",
                            background:
                                loading || !input.trim()
                                    ? "#e9d5ff"
                                    : "linear-gradient(135deg, #7c3aed, #9333ea)",
                            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            flexShrink: 0,
                        }}
                    >
                        <Send size={16} color={loading || !input.trim() ? "#a78bfa" : "white"} />
                    </button>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "none",
                    background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)",
                    boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4), 0 2px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isOpen ? "scale(0)" : "scale(1)",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = isOpen ? "scale(0)" : "scale(1.1)";
                    e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(124, 58, 237, 0.5), 0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = isOpen ? "scale(0)" : "scale(1)";
                    e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(124, 58, 237, 0.4), 0 2px 8px rgba(0,0,0,0.1)";
                }}
            >
                <MessageCircle size={24} color="white" fill="white" />
            </button>
        </>
    );
}
