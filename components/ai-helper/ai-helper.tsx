"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  Sparkles,
  X,
  Send,
  MoreHorizontal,
  Trash2,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OPEN_STORAGE_KEY = "retailflow.ai-helper.open";

type Sender = "bot" | "user";

interface Message {
  id: string;
  sender: Sender;
  text: string;
  ts: string; // ISO
}

interface Suggestion {
  label: string;
  reply: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    label: "Yangi hujjat qanday qo'shaman?",
    reply:
      "Hujjatlar sahifasiga o'ting va yuqori o'ng burchakdagi “Yangi hujjat” tugmasini bosing. Didox webhook avtomatik ravishda kelgan hujjatlarni qabul qiladi — qo'lda kiritish faqat zaxira variant.",
  },
  {
    label: "MXIK kodi noto'g'ri bo'lsa nima qilaman?",
    reply:
      "Hujjat tafsiloti sahifasidagi qatorda 4px chap chiziq (sariq yoki qizil rang) noaniqlikni bildiradi. “⚠” tugmasini bosing — AI taklif qilgan muqobil variantlardan birini tanlang yoki MXIK katalogidan qo'lda izlang.",
  },
  {
    label: "Insights qanday ishlaydi?",
    reply:
      "AI Insights kuniga 1 marta sizning ombor, hujjat va savdo ma'lumotlaringizni tahlil qiladi — past zaxira, narx oshishi, dublikat hujjat va boshqa anomaliyalarni topadi. Har bir tavsiyaga “Bajarish” tugmasi bilan to'g'ridan-to'g'ri amal qila olasiz.",
  },
];

const FALLBACK =
  "Tushundim! Bu savol bo'yicha batafsil yo'riqnoma /yordam sahifasida mavjud. [Yo'riqnomaga o'tish]";

const INITIAL_BOT_TEXT =
  "Salom! Men sizning AI yordamchingizman. Hujjat yaratish, MXIK kodi topish, hisobot, yoki boshqa savollar — istalganini so'rang.";

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildInitialMessages(): Message[] {
  return [
    {
      id: "initial_bot",
      sender: "bot",
      text: INITIAL_BOT_TEXT,
      ts: new Date().toISOString(),
    },
  ];
}

/** Pick a contextual mock reply based on user text. */
function pickReply(input: string): string {
  const lower = input.toLowerCase();
  for (const s of SUGGESTIONS) {
    if (lower === s.label.toLowerCase()) return s.reply;
  }
  if (lower.includes("hujjat") && (lower.includes("qo'sh") || lower.includes("yangi"))) {
    return SUGGESTIONS[0].reply;
  }
  if (lower.includes("mxik")) {
    return SUGGESTIONS[1].reply;
  }
  if (lower.includes("insight")) {
    return SUGGESTIONS[2].reply;
  }
  return FALLBACK;
}

export function AIHelper() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [thinking, setThinking] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate open state from localStorage on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(OPEN_STORAGE_KEY);
      if (stored === "true") setOpen(true);
    } catch {
      // localStorage unavailable — ignore.
    }
    setHydrated(true);
  }, []);

  // Persist open state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(OPEN_STORAGE_KEY, open ? "true" : "false");
    } catch {
      // ignore
    }
  }, [open, hydrated]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, thinking]);

  // Focus input on open.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Cleanup pending reply timers on unmount.
  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  // Close menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: uid(),
      sender: "user",
      text: trimmed,
      ts: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      const botMsg: Message = {
        id: uid(),
        sender: "bot",
        text: pickReply(trimmed),
        ts: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
      setThinking(false);
    }, 800);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleSuggestion(s: Suggestion) {
    setInput(s.label);
    inputRef.current?.focus();
  }

  function clearChat() {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    setMessages(buildInitialMessages());
    setThinking(false);
    setMenuOpen(false);
  }

  return (
    <>
      {/* Floating bubble — hidden when panel is open */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="AI yordamchini ochish"
          className={cn(
            "fixed bottom-6 right-6 z-50 grid place-items-center rounded-full bg-navy-700 text-white shadow-lg",
            "transition-all duration-200 hover:bg-navy-600 hover:scale-105 focus:outline-2 focus:outline-navy-700 focus:outline-offset-2"
          )}
          style={{ width: 56, height: 56 }}
        >
          <Sparkles className="size-6 animate-ai-pulse" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-lg border border-border bg-surface-card shadow-2xl",
            "animate-ai-panel-in"
          )}
          style={{ width: 380, maxWidth: "calc(100vw - 2rem)", height: 540, maxHeight: "calc(100vh - 3rem)" }}
          role="dialog"
          aria-label="RetailFlow AI yordamchi"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-navy-700 text-white">
                <Bot className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink-900 truncate">
                  RetailFlow Yordamchi
                </div>
                <div className="text-[11px] text-ink-500 font-mono truncate">
                  O&apos;zbek tilida AI yordam · GPT-4o-mini
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {/* Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                  }}
                  aria-label="Boshqa amallar"
                  className="grid size-7 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                >
                  <MoreHorizontal className="size-4" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-10 min-w-[160px] overflow-hidden rounded-md border border-border bg-surface-card shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={clearChat}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-100"
                    >
                      <Trash2 className="size-3.5" />
                      Suhbatni tozalash
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="grid size-7 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-surface px-3 py-3"
          >
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {/* Suggestion chips — show after initial bot message only */}
              {messages.length === 1 && (
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => handleSuggestion(s)}
                      className="text-left rounded-md border border-border bg-surface-card px-3 py-2 text-[12px] text-ink-700 hover:border-navy-700 hover:bg-navy-50 hover:text-navy-700 dark:text-navy-300 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {thinking && (
                <div className="flex items-center gap-1.5 self-start rounded-md border border-border bg-surface-card px-3 py-2">
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-400" />
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border bg-surface-card px-3 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Savolingizni yozing..."
              aria-label="AI yordamchiga xabar"
              className="h-9 flex-1 rounded-md border border-border-strong bg-surface-card px-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Yuborish"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-ink-300"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-md px-3 py-2 text-[13px] leading-relaxed",
          isUser
            ? "bg-emerald-50 text-ink-900"
            : "border border-border bg-surface-card text-ink-700"
        )}
      >
        {message.text}
      </div>
      <div className="mt-0.5 px-1 font-mono text-[10px] text-ink-400">
        {timeLabel(message.ts)}
      </div>
    </div>
  );
}
