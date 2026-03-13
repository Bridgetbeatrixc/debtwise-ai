"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, MessageSquare, ChevronRight, History } from "lucide-react";
import { getChatHistory, sendChatMessage, deleteChatHistory } from "@/lib/api";
import { ChatMessageType } from "@/lib/types";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function groupByDate(messages: ChatMessageType[]): { dateLabel: string; dateKey: string; msgs: ChatMessageType[] }[] {
  const groups = new Map<string, ChatMessageType[]>();
  for (const m of messages) {
    const d = m.created_at ? new Date(m.created_at) : new Date();
    const key = d.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 864e5).toDateString();
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([k, msgs]) => ({
      dateKey: k,
      dateLabel: k === today ? "Today" : k === yesterday ? "Yesterday" : new Date(k).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      msgs,
    }));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pastChatsSheetOpen, setPastChatsSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dateGroups = useMemo(() => groupByDate(messages), [messages]);
  const displayMessages = selectedDateKey
    ? (dateGroups.find((g) => g.dateKey === selectedDateKey)?.msgs ?? messages)
    : messages;

  function loadHistory() {
    getChatHistory()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages, isStreaming]);

  async function handleDelete() {
    try {
      await deleteChatHistory();
      setMessages([]);
      setSelectedDateKey(null);
      setDeleteDialogOpen(false);
      toast.success("Chat history cleared");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete chat history";
      toast.error(msg);
    }
  }

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

  const pastChatsContent = (
    <div className="space-y-1">
      {dateGroups.map((g) => (
        <button
          key={g.dateKey}
          onClick={() => {
            setSelectedDateKey(selectedDateKey === g.dateKey ? null : g.dateKey);
            setPastChatsSheetOpen(false);
          }}
          className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors ${
            selectedDateKey === g.dateKey ? "bg-primary/10 text-primary" : "hover:bg-muted"
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 shrink-0" />
            {g.dateLabel}
          </span>
          <ChevronRight className={`h-4 w-4 shrink-0 ${selectedDateKey === g.dateKey ? "rotate-90" : ""}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[400px] flex-col gap-4 md:h-[calc(100vh-8rem)] md:flex-row md:gap-4">
      {/* Past chat history sidebar - hidden on mobile, shown via sheet */}
      {dateGroups.length > 0 && (
        <div className="hidden w-full shrink-0 space-y-1 rounded-lg border p-2 md:block md:w-52">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Past Chats</p>
          {pastChatsContent}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col min-h-0">
      <div className="mb-2 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">AI Advisor</h1>
          <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">
            Chat with DebtWise AI about your debt situation
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {dateGroups.length > 0 && (
            <Sheet open={pastChatsSheetOpen} onOpenChange={setPastChatsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 md:hidden">
                  <History className="h-4 w-4" />
                  Past
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 max-w-[85vw]">
                <SheetHeader>
                  <SheetTitle>Past Chats</SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto pb-4">{pastChatsContent}</div>
              </SheetContent>
            </Sheet>
          )}
          {messages.length > 0 && (
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete chat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your chat messages. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await handleDelete();
                    setDeleteDialogOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {displayMessages.length === 0 && (
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

            {displayMessages.map((msg, i) => (
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
    </div>
  );
}
