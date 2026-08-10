"use client";

import { useEffect, useRef, useState } from "react";
import ReconlyMark, { RibbonLoader } from "@/components/ReconlyMark";
import { useAssist } from "./AssistProvider";
import {
  deleteConversation,
  getConversationMessages,
  listConversations,
  renameConversation,
} from "@/app/actions/assist";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What changed in my portfolio this month?",
  "Which transactions are still unreviewed?",
  "Explain my open compliance alerts",
  "Draft a monthly summary for my accountant",
];

export default function AssistPanel() {
  const { isOpen, close, chip, clearChip, consumePrefill, plan } = useAssist();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "de">("en");
  const [view, setView] = useState<"chat" | "history">("chat");
  const [history, setHistory] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // prefill from entry-point buttons
  useEffect(() => {
    if (!isOpen) return;
    const p = consumePrefill();
    if (p) setInput(p);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen, consumePrefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: msg, context: chip, language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((m) => m.slice(0, -2));
        setInput(msg); // never lose the typed message
        setError(data.error ?? "Request failed");
        return;
      }
      setConversationId(res.headers.get("x-conversation-id"));
      setRemaining(res.headers.get("x-remaining-month"));

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + chunk,
          };
          return next;
        });
      }
    } catch {
      setMessages((m) => m.slice(0, -2));
      setInput(msg);
      setError("Connection lost — please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function openHistory() {
    setView("history");
    setHistory((await listConversations()) as typeof history);
  }

  async function loadConversation(id: string) {
    const msgs = await getConversationMessages(id);
    setConversationId(id);
    setMessages(msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    setView("chat");
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setView("chat");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Reconly Assist">
      <div className="absolute inset-0 bg-black/40 md:bg-transparent" onClick={close} />
      <aside className="glass-strong absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/12 md:w-[420px] md:rounded-l-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ReconlyMark size={22} animate />
            <span className="text-sm font-medium text-white">Reconly Assist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLanguage((l) => (l === "en" ? "de" : "en"))}
              className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#9CA3AF] hover:text-white"
              title="Answer language"
            >
              {language}
            </button>
            <button
              onClick={newConversation}
              className="rounded-full p-1.5 text-[#9CA3AF] hover:bg-white/6 hover:text-white"
              title="New conversation"
              aria-label="New conversation"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={view === "history" ? () => setView("chat") : openHistory}
              className="rounded-full p-1.5 text-[#9CA3AF] hover:bg-white/6 hover:text-white"
              title="History"
              aria-label="Conversation history"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M8 4.5V8l2.5 1.5M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={close} className="rounded-full p-1.5 text-[#9CA3AF] hover:bg-white/6 hover:text-white" aria-label="Close">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {view === "history" ? (
          <div className="flex-1 overflow-y-auto p-4">
            {history.length === 0 ? (
              <p className="mt-10 text-center text-xs text-[#6B7280]">No past conversations.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="glass flex items-center justify-between gap-2 rounded-lg px-4 py-3">
                    <button onClick={() => loadConversation(h.id)} className="flex-1 text-left text-xs text-[#D1D5DB] hover:text-white">
                      {h.title}
                      <span className="mt-0.5 block text-[10px] text-[#6B7280]">{h.updated_at.slice(0, 10)}</span>
                    </button>
                    <button
                      onClick={async () => {
                        const t = prompt("Rename conversation", h.title);
                        if (t) {
                          await renameConversation(h.id, t);
                          openHistory();
                        }
                      }}
                      className="text-[10px] text-[#6B7280] hover:text-white"
                    >
                      Rename
                    </button>
                    <button
                      onClick={async () => {
                        await deleteConversation(h.id);
                        if (conversationId === h.id) newConversation();
                        openHistory();
                      }}
                      className="text-[10px] text-[#6B7280] hover:text-red-300"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="opacity-40">
                  <ReconlyMark size={64} />
                </div>
                <p className="mt-4 max-w-[240px] text-xs leading-relaxed text-[#6B7280]">
                  Ask about your own wallets, transactions, reports and alerts — or how to do
                  something in Reconly.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="glass rounded-full px-4 py-2 text-[11px] text-[#D1D5DB] transition-colors hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="ml-10 rounded-2xl rounded-br-md border border-white/14 bg-white/8 px-4 py-2.5 text-xs leading-relaxed text-white">
                      {m.content}
                    </div>
                  ) : (
                    <div key={i} className="border-l border-white/12 pl-4 text-xs leading-relaxed text-[#D1D5DB] whitespace-pre-wrap">
                      {m.content || (busy && i === messages.length - 1 ? <RibbonLoader size={18} /> : "")}
                      {m.content && !busy && i === messages.length - 1 && (
                        <div className="mt-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(m.content)}
                            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-[#6B7280] hover:text-white"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* footer */}
        <div className="border-t border-white/8 p-4">
          {chip && (
            <div className="mb-2 flex">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] text-[#D1D5DB]">
                {chip.label}
                <button onClick={clearChip} className="text-[#6B7280] hover:text-white" aria-label="Remove context">
                  ×
                </button>
              </span>
            </div>
          )}
          {error && <p className="mb-2 text-[11px] text-red-300/80">{error}</p>}
          <div className="glass flex items-end gap-2 rounded-xl p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask Assist…  (⌘K)"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-[#6B7280] focus:outline-none"
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="btn-primary !px-4 !py-1.5 text-xs disabled:opacity-40"
              aria-label="Send"
            >
              {busy ? <RibbonLoader size={14} /> : "Send"}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#6B7280]">
            {remaining && remaining !== "unlimited"
              ? `${remaining} messages left this month · `
              : ""}
            No tax, legal or investment advice · plan: {plan}
          </p>
        </div>
      </aside>
    </div>
  );
}
