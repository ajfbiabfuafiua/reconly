"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AssistContextChip {
  label: string;
  [k: string]: unknown;
}

interface AssistCtx {
  enabled: boolean;
  plan: string;
  isOpen: boolean;
  chip: AssistContextChip | null;
  prefill: string | null;
  open: (opts?: { chip?: AssistContextChip; prompt?: string }) => void;
  close: () => void;
  clearChip: () => void;
  consumePrefill: () => string | null;
}

const Ctx = createContext<AssistCtx | null>(null);

export function useAssist(): AssistCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssist outside provider");
  return ctx;
}

export function AssistProvider({
  children,
  enabled,
  plan,
}: {
  children: React.ReactNode;
  enabled: boolean;
  plan: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const [chip, setChip] = useState<AssistContextChip | null>(null);
  const [prefill, setPrefill] = useState<string | null>(null);

  const open = useCallback((opts?: { chip?: AssistContextChip; prompt?: string }) => {
    if (opts?.chip) setChip(opts.chip);
    if (opts?.prompt) setPrefill(opts.prompt);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const clearChip = useCallback(() => setChip(null), []);
  const consumePrefill = useCallback(() => {
    const p = prefill;
    setPrefill(null);
    return p;
  }, [prefill]);

  // Cmd/Ctrl+K opens the assistant
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  return (
    <Ctx.Provider value={{ enabled, plan, isOpen, chip, prefill, open, close, clearChip, consumePrefill }}>
      {children}
    </Ctx.Provider>
  );
}
