"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { getChatHistory, sendChatMessage } from "@/lib/api";
import { ChatMessageType } from "@/lib/types";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");

    const userMsg: ChatMessageType = {
      id: `temp-${Date.now()}`,
      user_id: "",
      message: text,
      role: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsg: ChatMessageType = {
      id: `temp-${Date.now()}-assistant`,
      user_id: "",
      message: "",
      role: "assistant",
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      await sendChatMessage(text, (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            last.message += token;
          }
          return updated;
        });
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && !last.message) {
          last.message = "Sorry, something went wrong. Please try again.";
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Advisor</h1>
        <p className="text-muted-foreground">
          Chat with DebtWise AI about your debt situation
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Start a conversation</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask me anything about your debt. Try &quot;How much debt do I
                  have?&quot; or &quot;What should I pay first?&quot;
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "How much debt do I have?",
                    "What should I pay first?",
                    "How long until I'm debt free?",
                    "Can I restructure my payments?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                      }}
                      className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={msg.id || i} role={msg.role} content={msg.message} />
            ))}

            {isStreaming && messages[messages.length - 1]?.message === "" && (
              <TypingIndicator />
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your debt..."
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
