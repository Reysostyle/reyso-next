"use client";

import { useEffect, useRef, useState } from "react";
import { REYSO_CONFIG } from "@/lib/config";
import { CHECKOUT_PHONE_KEY } from "@/lib/customer";
import { readRaw } from "@/lib/local-store";

// Floating support chat. Talks to SUPPORT_CHAT_URL (an n8n webhook);
// when that is not configured it explains the channel isn't live yet.

type Message = { role: "user" | "bot"; text: string; pending?: boolean };

const QUICK_REPLIES = [
  { label: "💰 قیمت محصولات", mode: "send", text: "قیمت محصولات چقدره؟" },
  { label: "📏 راهنمای سایز", mode: "send", text: "سایزبندی محصولات چطوریه؟" },
  { label: "🛍 نحوه‌ی سفارش", mode: "send", text: "چطور می‌تونم سفارش بدم؟" },
  { label: "📦 پیگیری سفارش", mode: "prefill", text: "کد سفارش: " },
  {
    label: "💬 صحبت با پشتیبانی",
    mode: "send",
    text: "می‌خوام با پشتیبانی صحبت کنم، لطفاً باهام تماس بگیرید.",
  },
] as const;

const GREETING =
  "سلام! من دستیار ReySo‌ام 👋 می‌تونی درباره‌ی وضعیت سفارش، قیمت‌ها، سایزبندی یا هر سوال دیگه‌ای بپرسی.";
const HISTORY_KEY = "reyso_chat_history";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("reyso_chat_session");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      sessionStorage.setItem("reyso_chat_session", id);
    }
    return id;
  } catch {
    return "no-session";
  }
}

function loadHistory(): Message[] {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: Message[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter((m) => !m.pending).slice(-20)));
  } catch {
    // chat still works, just won't survive a reload
  }
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const loaded = useRef(false);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [history, open]);

  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [open, busy]);

  function push(next: Message[]) {
    setHistory(next);
    saveHistory(next);
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    setBusy(true);

    const withUser: Message[] = [...history, { role: "user", text }];
    push(withUser);

    if (!REYSO_CONFIG.SUPPORT_CHAT_URL) {
      push([
        ...withUser,
        {
          role: "bot",
          text: "این بخش هنوز فعال نشده. فعلاً می‌تونی از طریق دایرکت اینستاگرام یا واتس‌اپ باهامون در ارتباط باشی.",
        },
      ]);
      setBusy(false);
      return;
    }

    setHistory([...withUser, { role: "bot", text: "...", pending: true }]);
    let reply: string;
    try {
      const res = await fetch(REYSO_CONFIG.SUPPORT_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          phone: readRaw(CHECKOUT_PHONE_KEY) || "",
          sessionId: sessionId(),
          page: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      reply = data?.reply || "متاسفانه الان نتونستم جواب بدم، لطفاً از دایرکت بپرس.";
    } catch {
      reply = "مشکلی تو ارتباط پیش اومد. لطفاً یا دوباره امتحان کن یا از دایرکت/واتس‌اپ پیام بده.";
    }
    push([...withUser, { role: "bot", text: reply }]);
    setBusy(false);
  }

  const shown: Message[] = history.length ? history : [{ role: "bot", text: GREETING }];

  return (
    <div id="support-chat" className="support-chat">
      <button
        id="support-chat-toggle"
        className="support-chat-toggle"
        aria-label="گفتگو با پشتیبانی ReySo"
        onClick={() => {
          // History lives in sessionStorage, so read it on first open
          // rather than during render (keeps server and client HTML equal).
          if (!loaded.current) {
            loaded.current = true;
            setHistory(loadHistory());
          }
          setOpen(!open);
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-4.7 3.5A.5.5 0 0 1 2.5 21V5a1 1 0 0 1 1-1Zm1 2v12.4L7.3 16H19V6H5Z" />
        </svg>
      </button>
      <div id="support-chat-panel" className="support-chat-panel" hidden={!open}>
        <div className="support-chat-header">
          <span>پشتیبانی ReySo</span>
          <button className="support-chat-header-close" aria-label="بستن" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4L13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z" />
            </svg>
          </button>
        </div>
        <div className="support-chat-messages" ref={messagesRef}>
          {shown.map((m, i) => (
            <div key={i} className={"support-chat-msg " + m.role + (m.pending ? " pending" : "")}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="support-chat-quick">
          {QUICK_REPLIES.map((item) => (
            <button
              key={item.label}
              type="button"
              className="support-chat-quick-btn"
              disabled={busy}
              onClick={() => {
                if (item.mode === "prefill") {
                  setInput(item.text);
                  inputRef.current?.focus();
                } else {
                  send(item.text);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <form
          className="support-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            className="support-chat-input"
            type="text"
            placeholder="سوالتو بپرس..."
            autoComplete="off"
            disabled={busy}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="support-chat-send" aria-label="ارسال" disabled={busy}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
