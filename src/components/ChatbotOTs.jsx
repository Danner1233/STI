import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// CONFIGURACIÓN — cambia la URL cuando reinicies ngrok
// ─────────────────────────────────────────────
const NGROK_URL_KEY = "sti_lm_url";
const DEFAULT_URL = "https://meatily-odoriferous-shaquana.ngrok-free.app";

const SYSTEM_PROMPT = `Eres el asistente de gestión de Órdenes de Trabajo (OTs) del sistema STI de telecomunicaciones.
Ayudas al técnico a gestionar órdenes de trabajo de clientes como Claro Colombia.

Puedes:
- Registrar nuevas OTs (pide: cliente, tipo de servicio, dirección, prioridad)
- Consultar y filtrar OTs existentes
- Cambiar estados (pendiente, en curso, lista)
- Dar resúmenes y estadísticas del día
- Redactar notas de gestión o reportes rápidos

Cuando registres o actualices una OT, incluye al final una línea con el formato exacto:
ACTION:REGISTER|client=...|type=...|address=...|priority=alta|status=pending
o para cambiar estado:
ACTION:UPDATE|id=OT-XXXX|status=done

Solo incluye ACTION: cuando realmente se ejecute una acción, no en respuestas informativas.
Responde siempre en español, de forma concisa y práctica.`;

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────
function genId(list) {
  const next = (list.length + 1).toString().padStart(4, "0");
  return `OT-${next}`;
}

function parseAction(text, otList, setOtList) {
  const lines = text.split("\n");
  const clean = [];
  for (const line of lines) {
    if (line.startsWith("ACTION:REGISTER|")) {
      const params = Object.fromEntries(
        line.replace("ACTION:REGISTER|", "").split("|").map((p) => p.split("="))
      );
      const newOT = {
        id: genId(otList),
        client: params.client || "Sin cliente",
        type: params.type || "General",
        address: params.address || "Sin dirección",
        priority: params.priority || "media",
        status: params.status || "pending",
        date: new Date().toLocaleDateString("es-CO"),
      };
      setOtList((prev) => [...prev, newOT]);
    } else if (line.startsWith("ACTION:UPDATE|")) {
      const params = Object.fromEntries(
        line.replace("ACTION:UPDATE|", "").split("|").map((p) => p.split("="))
      );
      setOtList((prev) =>
        prev.map((o) => (o.id === params.id ? { ...o, status: params.status } : o))
      );
    } else {
      clean.push(line);
    }
  }
  return clean.join("\n").trim();
}

const STATUS_LABEL = { pending: "Pendiente", inprogress: "En curso", done: "Lista" };
const STATUS_COLOR = {
  pending: { bg: "#fff8ed", color: "#92400e", border: "#fcd34d" },
  inprogress: { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" },
  done: { bg: "#f0fdf4", color: "#166534", border: "#86efac" },
};
const PRIORITY_COLOR = {
  alta: { bg: "#fef2f2", color: "#991b1b" },
  media: { bg: "#fffbeb", color: "#92400e" },
  baja: { bg: "#f0fdf4", color: "#166534" },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function ChatbotOTs() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("chat"); // "chat" | "ots"
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "¡Hola! Soy tu asistente de OTs conectado a tu modelo local.\n\n¿Qué necesitas? Puedo registrar nuevas OTs, consultar pendientes o darte un resumen del día.",
      time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [otList, setOtList] = useState([
    { id: "OT-0001", client: "Claro Colombia", type: "Instalación fibra", address: "Cra 70 #45-12, Medellín", priority: "alta", status: "pending", date: "13/03/2026" },
    { id: "OT-0002", client: "Claro Colombia", type: "Avería internet", address: "Cl 30 #80-55, Itagüí", priority: "alta", status: "inprogress", date: "13/03/2026" },
    { id: "OT-0003", client: "Claro Colombia", type: "Reubicación ONT", address: "Av El Poblado #15-22", priority: "media", status: "pending", date: "12/03/2026" },
  ]);
  const [lmUrl, setLmUrl] = useState(() => localStorage.getItem(NGROK_URL_KEY) || DEFAULT_URL);
  const [showConfig, setShowConfig] = useState(false);
  const [urlInput, setUrlInput] = useState(lmUrl);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveUrl = () => {
    const clean = urlInput.replace(/\/$/, "");
    setLmUrl(clean);
    localStorage.setItem(NGROK_URL_KEY, clean);
    setShowConfig(false);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const time = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text: msg, time }]);
    setLoading(true);

    const newHistory = [...history, { role: "user", content: msg }];
    setHistory(newHistory);

    try {
      const res = await fetch(`${lmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          model: "local-model",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + `\n\nOTs actuales: ${JSON.stringify(otList)}` },
            ...newHistory,
          ],
          temperature: 0.7,
          max_tokens: 800,
          stream: false,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sin respuesta del modelo.";
      const clean = parseAction(reply, otList, setOtList);
      const replyTime = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { role: "bot", text: clean, time: replyTime }]);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      const errTime = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `❌ No se pudo conectar con LM Studio.\n\n• Verifica que LM Studio esté corriendo en puerto 1234\n• Verifica que ngrok esté activo\n• Revisa la URL en configuración ⚙️`,
          time: errTime,
        },
      ]);
    }
    setLoading(false);
  };

  const stats = {
    pending: otList.filter((o) => o.status === "pending").length,
    inprogress: otList.filter((o) => o.status === "inprogress").length,
    done: otList.filter((o) => o.status === "done").length,
  };

  const quickActions = [
    "Ver todas las OTs",
    "Registrar nueva OT",
    "¿Cuáles son urgentes?",
    "Resumen del día",
  ];

  // ── Render ──
  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#1d4ed8",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
            zIndex: 9999,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
          {stats.pending > 0 && (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#ef4444",
                color: "white",
                fontSize: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              {stats.pending}
            </span>
          )}
        </button>
      )}

      {/* Panel principal */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 400,
            height: 580,
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            fontFamily: "system-ui, -apple-system, sans-serif",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1d4ed8",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "white", fontWeight: 600, fontSize: 14, flex: 1 }}>
              Asistente OTs — STI
            </span>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, padding: 4 }}
              title="Configurar URL"
            >
              ⚙️
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>

          {/* Config URL */}
          {showConfig && (
            <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>URL de ngrok (LM Studio):</p>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{ flex: 1, fontSize: 11, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "monospace" }}
                  placeholder="https://xxxx.ngrok-free.app"
                />
                <button
                  onClick={saveUrl}
                  style={{ padding: "5px 10px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            {["chat", "ots"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? "2px solid #1d4ed8" : "2px solid transparent",
                  color: tab === t ? "#1d4ed8" : "#6b7280",
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t === "chat" ? "💬 Chat" : `📋 OTs (${otList.length})`}
              </button>
            ))}
          </div>

          {/* Tab: Chat */}
          {tab === "chat" && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "9px 13px",
                        borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: m.role === "user" ? "#1d4ed8" : "#f3f4f6",
                        color: m.role === "user" ? "white" : "#111827",
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                    <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 3, paddingInline: 4 }}>{m.time}</span>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ padding: "9px 13px", borderRadius: "14px 14px 14px 4px", background: "#f3f4f6", display: "flex", gap: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 6, height: 6, borderRadius: "50%", background: "#9ca3af",
                            animation: "bounce 1.2s infinite",
                            animationDelay: `${i * 0.2}s`,
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              <div style={{ padding: "6px 14px", display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
                {quickActions.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => sendMessage(qa)}
                    style={{
                      fontSize: 11, padding: "4px 9px", borderRadius: 999,
                      border: "1px solid #e5e7eb", background: "#f9fafb",
                      color: "#374151", cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {qa}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: "10px 14px 14px", display: "flex", gap: 8, flexShrink: 0, borderTop: "1px solid #e5e7eb" }}>
                <textarea
                  value={input}
                  onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px"; }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Escribe tu OT o pregunta..."
                  rows={1}
                  style={{
                    flex: 1, resize: "none", border: "1px solid #d1d5db", borderRadius: 10,
                    padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
                    outline: "none", maxHeight: 90, lineHeight: 1.4, background: "#f9fafb",
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", border: "none",
                    background: loading || !input.trim() ? "#e5e7eb" : "#1d4ed8",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={loading || !input.trim() ? "#9ca3af" : "white"}>
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Tab: OTs */}
          {tab === "ots" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 14px 8px" }}>
                {[["Pendientes", stats.pending, "#fef3c7", "#92400e"], ["En curso", stats.inprogress, "#dbeafe", "#1e40af"], ["Listas", stats.done, "#dcfce7", "#166534"]].map(([l, n, bg, c]) => (
                  <div key={l} style={{ background: bg, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{n}</div>
                    <div style={{ fontSize: 10, color: c, opacity: 0.8 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Lista */}
              <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {otList.map((ot) => {
                  const sc = STATUS_COLOR[ot.status] || STATUS_COLOR.pending;
                  const pc = PRIORITY_COLOR[ot.priority] || PRIORITY_COLOR.media;
                  return (
                    <div
                      key={ot.id}
                      style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}
                      onClick={() => { setTab("chat"); sendMessage(`Dame detalles de ${ot.id}`); }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{ot.id}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: pc.bg, color: pc.color, fontWeight: 500 }}>{ot.priority}</span>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 500 }}>{STATUS_LABEL[ot.status]}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}>{ot.type}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{ot.client} · {ot.address}</div>
                    </div>
                  );
                })}
                <button
                  onClick={() => { setTab("chat"); sendMessage("Quiero registrar una nueva OT"); }}
                  style={{ padding: "9px", border: "1.5px dashed #d1d5db", borderRadius: 10, background: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", marginTop: 4 }}
                >
                  + Nueva OT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
