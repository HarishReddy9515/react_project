import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Text } from "@fluentui/react-components";
import background from "./assets/background.jpg";

const API_BASE = "http://127.0.0.1:8000/api/v1";
const STORAGE_KEY = "chat_sessions_v1";
const MAX_CONTEXT_MESSAGES = 12; // send only last N to backend

const TOPICS = [
  { label: "Interview Prep", prompt: "You are my interview coach. Ask clarifying questions and give structured advice." },
  { label: "DSA", prompt: "Teach me DSA step-by-step with simple examples and practice questions." },
  { label: "Full-Stack", prompt: "Act as a senior full-stack mentor. Give practical steps and code tips." },
  { label: "AI/ML", prompt: "Explain ML from scratch in very simple terms with examples." },
  { label: "SQL/DB", prompt: "Teach SQL with practice questions and corrections." },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Bubble({ role, children, onCopy }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.06)",
          background: isUser ? "rgba(37, 99, 235, 0.10)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.35,
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {!isUser && (
          <button
            onClick={onCopy}
            title="Copy"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.9)",
              borderRadius: 10,
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Copy
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function Chip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid rgba(255,255,255,0.28)",
        background: "rgba(255,255,255,0.14)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 999,
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}

export default function Chat({ goBack }) {
  const [sessions, setSessions] = useState(() => {
    const s = loadSessions();
    return s.length ? s : [{
      id: uid(),
      title: "New chat",
      topic: "",
      messages: [
        { role: "assistant", content: "Hi Harish 👋\nPick a topic or ask me anything." }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }];
  });

  const [activeId, setActiveId] = useState(() => loadSessions()[0]?.id || sessions?.[0]?.id);
  const [showSidebar, setShowSidebar] = useState(true);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) || sessions[0],
    [sessions, activeId]
  );

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, loading]);

  const promptSuggestions = useMemo(() => {
    const t = active?.topic;
    if (!t) {
      return [
        "Create a 2-week plan to improve my coding skills.",
        "Explain React state & props with examples.",
        "Help me debug my FastAPI + Postgres project.",
        "Give me 10 SQL practice questions with answers.",
      ];
    }
    return [
      `Give me a beginner roadmap for ${t}.`,
      `Ask me 5 questions to assess my level in ${t}.`,
      `Give me one mini-project idea for ${t} and steps.`,
      `Explain the top 5 concepts in ${t} with examples.`,
    ];
  }, [active?.topic]);

  function updateActive(patchFn) {
    setSessions((prev) =>
      prev.map((s) => (s.id === active.id ? patchFn(s) : s))
    );
  }

  function newChat() {
    const s = {
      id: uid(),
      title: "New chat",
      topic: "",
      messages: [{ role: "assistant", content: "Hi Harish 👋\nPick a topic or ask me anything." }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
  }

  function deleteChat(id) {
    setSessions((prev) => {
      const next = prev.filter((x) => x.id !== id);
      const safe = next.length ? next : [{
        id: uid(),
        title: "New chat",
        topic: "",
        messages: [{ role: "assistant", content: "Hi Harish 👋\nPick a topic or ask me anything." }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }];
      // fix active if deleted
      if (id === activeId) setActiveId(safe[0].id);
      return safe;
    });
  }

  function renameChat(id) {
    const name = prompt("Rename this chat:", sessions.find(s => s.id === id)?.title || "New chat");
    if (!name) return;
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title: name, updatedAt: Date.now() } : s));
  }

  function exportChat() {
    const lines = active.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`);
    downloadText(`${active.title.replaceAll(" ", "_") || "chat"}.txt`, lines.join("\n\n"));
  }

  async function send(customText) {
    const content = (customText ?? text).trim();
    if (!content || loading) return;

    const nextMsgs = [...active.messages, { role: "user", content }];

    // simple title auto-set based on first user message
    const newTitle =
      active.title === "New chat" && nextMsgs.filter(m => m.role === "user").length === 1
        ? content.slice(0, 28)
        : active.title;

    updateActive((s) => ({
      ...s,
      title: newTitle,
      messages: nextMsgs,
      updatedAt: Date.now(),
    }));
    setText("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // send only last N messages for context
      const contextMessages = nextMsgs.slice(-MAX_CONTEXT_MESSAGES);

      // add topic/system instruction as first message (optional)
      const payloadMessages = active.topic
        ? [{ role: "system", content: active.topic }, ...contextMessages]
        : contextMessages;

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

      updateActive((s) => ({
        ...s,
        messages: [...nextMsgs, { role: "assistant", content: data.reply }],
        updatedAt: Date.now(),
      }));
    } catch (e) {
      updateActive((s) => ({
        ...s,
        messages: [...nextMsgs, { role: "assistant", content: `❌ ${e.message}` }],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  }

  async function regenerateLast() {
    if (loading) return;

    // Find last user message and remove last assistant reply (if exists)
    const msgs = [...active.messages];
    if (msgs.length < 2) return;

    // Remove trailing assistant message if present
    if (msgs[msgs.length - 1].role === "assistant") msgs.pop();

    // Re-call with last messages
    updateActive((s) => ({ ...s, messages: msgs, updatedAt: Date.now() }));
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const contextMessages = msgs.slice(-MAX_CONTEXT_MESSAGES);
      const payloadMessages = active.topic
        ? [{ role: "system", content: active.topic }, ...contextMessages]
        : contextMessages;

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

      updateActive((s) => ({
        ...s,
        messages: [...msgs, { role: "assistant", content: data.reply }],
        updatedAt: Date.now(),
      }));
    } catch (e) {
      updateActive((s) => ({
        ...s,
        messages: [...msgs, { role: "assistant", content: `❌ ${e.message}` }],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  }

  function chooseTopic(t) {
    updateActive((s) => ({ ...s, topic: t.prompt, updatedAt: Date.now() }));
    send(`My topic: ${t.label}. Start by asking me 3 questions to know my level.`);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed (browser permissions).");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", marginBottom: 14 }}>
          <div>
            <Text size={700} weight="bold" style={{ color: "#fff" }}>AI Assistant</Text>
            <div style={{ opacity: 0.9, fontSize: 13, marginTop: 2 }}>
              {active?.title || "Chat"} {active?.topic ? "• Topic mode" : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button appearance="secondary" onClick={() => setShowSidebar((v) => !v)}>
              {showSidebar ? "Hide History" : "Show History"}
            </Button>
            <Button appearance="secondary" onClick={exportChat}>Export</Button>
            <Button appearance="secondary" onClick={regenerateLast} disabled={loading}>
              Regenerate
            </Button>
            <Button appearance="secondary" onClick={goBack}>Back</Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: showSidebar ? "320px 1fr" : "1fr", gap: 14 }}>
          {/* Sidebar */}
          {showSidebar && (
            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                padding: 12,
                color: "#fff",
                height: "78vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text weight="semibold" style={{ color: "#fff" }}>Chats</Text>
                <Button appearance="primary" onClick={newChat}>New</Button>
              </div>

              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: 10,
                    borderRadius: 14,
                    marginBottom: 8,
                    cursor: "pointer",
                    border: s.id === activeId ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.18)",
                    background: s.id === activeId ? "rgba(0,0,0,0.20)" : "rgba(0,0,0,0.12)",
                  }}
                  onClick={() => setActiveId(s.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                  <div style={{ opacity: 0.85, fontSize: 12, marginTop: 4 }}>
                    {new Date(s.updatedAt).toLocaleString()}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); renameChat(s.id); }}
                      style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.10)", color: "#fff", borderRadius: 999, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}
                    >
                      Rename
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }}
                      style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,0,0,0.10)", color: "#fff", borderRadius: 999, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main chat */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 18px 55px rgba(0,0,0,0.30)",
              overflow: "hidden",
            }}
          >
            {/* Topic chips */}
            <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.14)", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Text size={400} style={{ color: "#fff", opacity: 0.92 }}>
                Topics:
              </Text>
              {TOPICS.map((t) => (
                <Chip key={t.label} label={t.label} onClick={() => chooseTopic(t)} />
              ))}
              <Button
                appearance="secondary"
                onClick={() => updateActive((s) => ({ ...s, topic: "", updatedAt: Date.now() }))}
              >
                Clear Topic
              </Button>
            </div>

            {/* Chat area */}
            <div style={{ height: "58vh", padding: 16, overflowY: "auto" }}>
              {active.messages.map((m, i) => (
                <Bubble
                  key={i}
                  role={m.role}
                  onCopy={() => copyText(m.content)}
                >
                  {m.content}
                </Bubble>
              ))}
              {loading && <Bubble role="assistant">Thinking…</Bubble>}
              <div ref={scrollRef} />
            </div>

            {/* Suggestions */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.14)", display: "flex", gap: 10, flexWrap: "wrap" }}>
              {promptSuggestions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => send(p)}
                  style={{
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(0,0,0,0.15)",
                    color: "#fff",
                    padding: "8px 10px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: 12.5,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.14)", display: "flex", gap: 10, alignItems: "center" }}>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                style={{ width: "100%" }}
                placeholder="Type your message…"
              />
              <Button appearance="primary" onClick={() => send()} disabled={loading}>
                Send
              </Button>
            </div>
          </div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 10 }}>
          History is stored locally (localStorage).
        </div>
      </div>
    </div>
  );
}
