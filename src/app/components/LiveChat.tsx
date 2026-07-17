import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Volume2, Mic } from "lucide-react";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";

interface LiveChatProps {
  lang: Lang;
  darkMode: boolean;
}

interface Message {
  id: string;
  from: "user" | "agent";
  text: string;
  time: string;
}

const agentReplies = [
  "Hello! I'm Maya, your MedCare support assistant. How can I help you today?",
  "I understand. Let me look into that for you right away.",
  "You can book appointments by clicking the 'Book Appointment' button on the home screen and selecting your preferred doctor.",
  "For emergency services, click the red 'Emergency' button or call 108 immediately.",
  "Our doctors are available 24/7 for video consultations. Would you like me to help you find the right specialist?",
  "I've noted your concern. Our medical team will review this and get back to you shortly.",
  "Is there anything else I can help you with today?",
  "For prescription medicines, please upload your prescription in the Medicine Shop section.",
  "Great! Your satisfaction is our priority. Have a healthy day! 😊",
];

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  window.speechSynthesis.speak(u);
}

export function LiveChat({ lang, darkMode }: LiveChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", from: "agent", text: "Hi there! 👋 I'm Maya, your MedCare assistant. How can I help you today?", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), from: "user", text, time: getTime() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = agentReplies[replyIdx % agentReplies.length];
      setReplyIdx((i) => i + 1);
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), from: "agent", text: reply, time: getTime() }]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-IN";
    setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  const bg = darkMode ? "#1e293b" : "white";
  const inputBg = darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-800";

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)", boxShadow: "0 8px 25px rgba(26,111,212,0.4)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!open ? { y: [0, -6, 0] } : {}}
        transition={!open ? { duration: 2, repeat: Infinity } : {}}
        aria-label="Open chat support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Unread badge */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">1</span>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[340px] rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: bg, border: `1px solid ${darkMode ? "rgba(99,179,237,0.15)" : "rgba(26,111,212,0.1)"}` }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="p-4 text-white" style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🧑‍⚕️</div>
                <div>
                  <p className="font-bold text-sm">{t(lang, "chatTitle")}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-blue-100">Maya — Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`max-w-[80%] ${msg.from === "user" ? "" : "flex gap-2 items-end"}`}>
                    {msg.from === "agent" && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0 mb-0.5">🧑‍⚕️</div>
                    )}
                    <div>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.from === "user"
                          ? "text-white rounded-br-sm"
                          : darkMode ? "bg-slate-700 text-slate-100 rounded-bl-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}
                        style={msg.from === "user" ? { background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" } : {}}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${msg.from === "user" ? "justify-end" : ""}`}>
                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                        {msg.from === "agent" && (
                          <button onClick={() => speak(msg.text)} aria-label="Read message">
                            <Volume2 size={10} className="text-slate-400 hover:text-blue-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div className="flex gap-2 items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">🧑‍⚕️</div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"
                            animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className={`px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-hide ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
              {["Book Appointment", "Emergency Help", "Medicine Order"].map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-blue-50"}`}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
              <div className="flex gap-2">
                <input
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:border-blue-400 ${inputBg}`}
                  placeholder={t(lang, "chatPlaceholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                />
                <button onClick={handleVoice}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${listening ? "bg-red-500" : darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-blue-50"}`}>
                  <Mic size={15} className={listening ? "text-white" : "text-slate-400"} />
                </button>
                <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-white disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
