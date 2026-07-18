import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Video, Star, Clock, CreditCard, CheckCircle, Mic, MicOff, Camera, CameraOff, Phone, MessageSquare, Users } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";
import { bookVideoConsultation } from "../services/api";

// Removed VideoConsultProps

const categories = [
  { id: "general", label: "General Physician", icon: "🩺", color: "#1a6fd4" },
  { id: "cardio", label: "Cardiology", icon: "❤️", color: "#dc2626" },
  { id: "ortho", label: "Orthopedic", icon: "🦴", color: "#7c3aed" },
  { id: "derma", label: "Dermatology", icon: "🌿", color: "#16a34a" },
  { id: "gyno", label: "Gynecology", icon: "🌸", color: "#db2777" },
  { id: "neuro", label: "Neurology", icon: "🧠", color: "#0891b2" },
  { id: "pedia", label: "Pediatrics", icon: "👶", color: "#d97706" },
  { id: "ent", label: "ENT", icon: "👂", color: "#65a30d" },
  { id: "psych", label: "Psychiatry", icon: "🧘", color: "#6d28d9" },
  { id: "dental", label: "Dental", icon: "🦷", color: "#0d9488" },
];

const doctorsByCategory: Record<string, { name: string; exp: string; langs: string[]; fee: string; slots: string[]; rating: number }[]> = {
  general: [
    { name: "Dr. Anil Mehta", exp: "12 yrs", langs: ["English", "Hindi"], fee: "₹400", slots: ["10:00", "11:00", "14:00", "15:30"], rating: 4.8 },
    { name: "Dr. Sunita Rao", exp: "8 yrs", langs: ["English", "Kannada", "Telugu"], fee: "₹350", slots: ["09:30", "11:30", "16:00"], rating: 4.7 },
  ],
  cardio: [
    { name: "Dr. Ramesh Iyer", exp: "18 yrs", langs: ["English", "Tamil"], fee: "₹900", slots: ["10:00", "14:00", "16:00"], rating: 4.9 },
    { name: "Dr. Priya Gupta", exp: "14 yrs", langs: ["English", "Hindi"], fee: "₹800", slots: ["09:00", "11:00", "15:00"], rating: 4.7 },
  ],
  ortho: [
    { name: "Dr. Sanjay Patel", exp: "16 yrs", langs: ["English", "Gujarati", "Hindi"], fee: "₹700", slots: ["10:30", "13:00", "15:30"], rating: 4.6 },
  ],
  derma: [
    { name: "Dr. Kavita Singh", exp: "10 yrs", langs: ["English", "Hindi"], fee: "₹600", slots: ["09:00", "11:00", "14:30", "16:00"], rating: 4.8 },
  ],
  gyno: [
    { name: "Dr. Meera Pillai", exp: "15 yrs", langs: ["English", "Malayalam", "Tamil"], fee: "₹750", slots: ["10:00", "12:00", "14:00"], rating: 4.9 },
  ],
  neuro: [
    { name: "Dr. Arjun Nair", exp: "20 yrs", langs: ["English", "Malayalam"], fee: "₹1100", slots: ["11:00", "14:00"], rating: 4.9 },
  ],
  pedia: [
    { name: "Dr. Vijay Kumar", exp: "12 yrs", langs: ["English", "Hindi", "Kannada"], fee: "₹500", slots: ["09:00", "10:00", "14:00", "16:00"], rating: 4.8 },
  ],
  ent: [
    { name: "Dr. Deepa Krishnan", exp: "9 yrs", langs: ["English", "Tamil", "Telugu"], fee: "₹550", slots: ["10:00", "13:00", "15:00"], rating: 4.6 },
  ],
  psych: [
    { name: "Dr. Rahul Verma", exp: "11 yrs", langs: ["English", "Hindi"], fee: "₹800", slots: ["11:00", "15:00", "17:00"], rating: 4.7 },
  ],
  dental: [
    { name: "Dr. Pritha Sen", exp: "7 yrs", langs: ["English", "Bengali", "Hindi"], fee: "₹450", slots: ["09:30", "11:30", "14:00", "16:30"], rating: 4.5 },
  ],
};

type PaymentMethod = "upi" | "card" | "debit" | "netbanking";

export function VideoConsultation() {
  const navigate = useNavigate();
  const { addNotification: onNotify } = useGlobal();
  const [step, setStep] = useState<"category" | "doctors" | "payment" | "scheduled" | "call">("category");
  const [selectedCat, setSelectedCat] = useState(categories[0]);
  const [selectedDoc, setSelectedDoc] = useState(doctorsByCategory["general"][0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [countdown, setCountdown] = useState(900);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "doctor", text: "Hello! I can see you. How are you feeling today?" },
  ]);

  useEffect(() => {
    if (step === "scheduled") {
      const int = setInterval(() => setCountdown((c) => c > 0 ? c - 1 : 0), 1000);
      return () => clearInterval(int);
    }
  }, [step]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const [loading, setLoading] = useState(false);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await bookVideoConsultation({
        doctor_name: selectedDoc.name,
        department: selectedCat.id,
        date: new Date().toISOString().split('T')[0],
        slot: selectedSlot,
        upi_id: payMethod === "upi" ? upiId : "card-payment",
      });
      onNotify({ type: "consultation", title: "Video Consultation Scheduled", message: `${selectedDoc.name} at ${selectedSlot}` });
      setStep("scheduled");
    } catch (err) {
      alert("Failed to schedule consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function sendMessage() {
    if (!chatMsg.trim()) return;
    setMessages([...messages, { from: "patient", text: chatMsg }]);
    setChatMsg("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "doctor", text: "I understand. Let me examine that further." }]);
    }, 1500);
  }

  const doctors = doctorsByCategory[selectedCat.id] || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "linear-gradient(160deg, #faf5ff 0%, #eff6ff 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step !== "call" && (
            <button onClick={() => {
              if (step === "category") navigate(-1);
              else if (step === "doctors") setStep("category");
              else if (step === "payment") setStep("doctors");
              else if (step === "scheduled") setStep("payment");
            }} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 mb-5 transition-colors text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {/* Header */}
          {step !== "call" && (
            <div className="rounded-3xl p-5 mb-5 text-white flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 12px 30px rgba(124,58,237,0.3)" }}>
              <Video size={28} />
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Video Consultation</h1>
                <p className="text-purple-200 text-sm">Connect with certified doctors online</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* CATEGORY */}
            {step === "category" && (
              <motion.div key="cat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>Choose Specialization</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat, i) => (
                    <motion.button key={cat.id}
                      onClick={() => { setSelectedCat(cat); setSelectedDoc(doctorsByCategory[cat.id]?.[0]); setStep("doctors"); }}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border-2 border-transparent hover:border-purple-200 transition-all text-center"
                      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.03 }}>
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-xs font-semibold text-slate-700">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DOCTORS */}
            {step === "doctors" && (
              <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{selectedCat.icon}</span>
                  <h2 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{selectedCat.label} Doctors</h2>
                </div>
                <div className="space-y-4">
                  {doctors.map((doc) => (
                    <motion.div key={doc.name} className="bg-white rounded-2xl p-5 shadow-sm" whileHover={{ scale: 1.01 }}>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                          style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedCat.color}aa)` }}>
                          {doc.name.split(" ")[1][0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm">{doc.name}</h3>
                              <p className="text-xs text-slate-500">{doc.exp} experience</p>
                              <p className="text-xs text-slate-500 mt-0.5">Speaks: {doc.langs.join(", ")}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-sm">{doc.fee}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <span className="text-xs">{doc.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2">Available slots:</p>
                            <div className="flex flex-wrap gap-2">
                              {doc.slots.map((slot) => (
                                <button key={slot} onClick={() => { setSelectedDoc(doc); setSelectedSlot(slot); }}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedDoc === doc && selectedSlot === slot ? "text-white" : "bg-slate-50 text-slate-700 hover:bg-purple-50"}`}
                                  style={selectedDoc === doc && selectedSlot === slot ? { background: selectedCat.color } : {}}>
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedDoc === doc && selectedSlot && (
                        <motion.button onClick={() => setStep("payment")} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{ background: `linear-gradient(135deg, ${selectedCat.color}, #7c3aed)` }}>
                          Book at {selectedSlot} →
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PAYMENT */}
            {step === "payment" && (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{selectedDoc.name}</p>
                    <p className="text-xs text-slate-500">{selectedCat.label} · {selectedSlot}</p>
                  </div>
                  <p className="font-bold text-green-600">{selectedDoc.fee}</p>
                </div>

                <form onSubmit={handlePayment} className="bg-white rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {([
                      { id: "upi", label: "UPI", icon: "₹" },
                      { id: "card", label: "Credit Card", icon: "💳" },
                      { id: "debit", label: "Debit Card", icon: "🏦" },
                      { id: "netbanking", label: "Net Banking", icon: "🌐" },
                    ] as { id: PaymentMethod; label: string; icon: string }[]).map((m) => (
                      <button key={m.id} type="button" onClick={() => setPayMethod(m.id)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 text-sm font-medium transition-all ${payMethod === m.id ? "border-purple-400 bg-purple-50 text-purple-700" : "border-slate-100 text-slate-600 hover:border-purple-200"}`}>
                        <span>{m.icon}</span> {m.label}
                      </button>
                    ))}
                  </div>

                  {payMethod === "upi" && (
                    <input className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-purple-400 bg-slate-50 mb-4"
                      style={{ borderColor: "rgba(124,58,237,0.2)" }}
                      placeholder="Enter UPI ID (e.g. yourname@upi)"
                      value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  )}
                  {(payMethod === "card" || payMethod === "debit") && (
                    <div className="space-y-3 mb-4">
                      <input className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-purple-400 bg-slate-50"
                        style={{ borderColor: "rgba(124,58,237,0.2)" }} placeholder="Card Number" />
                      <div className="grid grid-cols-2 gap-3">
                        <input className="px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-purple-400 bg-slate-50"
                          style={{ borderColor: "rgba(124,58,237,0.2)" }} placeholder="MM/YY" />
                        <input className="px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-purple-400 bg-slate-50"
                          style={{ borderColor: "rgba(124,58,237,0.2)" }} placeholder="CVV" />
                      </div>
                    </div>
                  )}

                  <button type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg'}`}
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                    <CreditCard size={18} /> {loading ? "Processing..." : `Pay ${selectedDoc.fee}`}
                  </button>
                </form>
              </motion.div>
            )}

            {/* SCHEDULED */}
            {step === "scheduled" && (
              <motion.div key="sched" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.2 }}>
                    <CheckCircle size={64} className="mx-auto mb-3 text-green-500" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Consultation Scheduled!</h2>
                  <p className="text-slate-500 text-sm">Payment successful · Reminder added</p>

                  <div className="mt-6 p-5 rounded-2xl bg-purple-50">
                    <p className="text-xs text-slate-500 mb-1">Session starts in</p>
                    <p className="text-4xl font-bold tabular-nums" style={{ color: "#7c3aed" }}>{formatTime(countdown)}</p>
                    <p className="text-sm text-slate-600 mt-2">{selectedDoc.name} · {selectedSlot}</p>
                  </div>

                  <motion.button onClick={() => setStep("call")}
                    className="w-full mt-6 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                    animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Video size={18} /> Join Video Call
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* VIDEO CALL */}
            {step === "call" && (
              <motion.div key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex flex-col"
                style={{ background: "#0d1117" }}>
                {/* Doctor video */}
                <div className="flex-1 relative">
                  <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=500&fit=crop&auto=format" alt="Doctor"
                    className="w-full h-full object-cover opacity-80" />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
                    {selectedDoc.name}
                  </div>

                  {/* Patient video (PiP) */}
                  <div className="absolute top-4 right-4 w-28 h-20 rounded-xl overflow-hidden border-2 border-white/20">
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" }}>
                      {camOff ? <CameraOff size={24} className="text-white opacity-50" /> : <span className="text-white text-2xl font-bold">You</span>}
                    </div>
                  </div>

                  {/* Chat overlay */}
                  <div className="absolute bottom-16 left-0 right-0 px-4 max-h-40 overflow-y-auto space-y-2">
                    {messages.slice(-3).map((m, i) => (
                      <div key={i} className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}>
                        <div className="px-3 py-1.5 rounded-2xl text-sm max-w-xs"
                          style={{ background: m.from === "patient" ? "#7c3aed" : "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(10px)" }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 pb-8" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <input className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 text-sm outline-none border border-white/10"
                      placeholder="Type a message..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} />
                    <button onClick={sendMessage} className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-600">
                      <MessageSquare size={18} className="text-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setMuted(!muted)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? "bg-red-500" : "bg-white/20"}`}>
                      {muted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                    </button>
                    <button onClick={() => setCamOff(!camOff)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${camOff ? "bg-red-500" : "bg-white/20"}`}>
                      {camOff ? <CameraOff size={20} className="text-white" /> : <Camera size={20} className="text-white" />}
                    </button>
                    <button onClick={() => { setStep("scheduled"); navigate(-1); }}
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 shadow-lg shadow-red-500/40">
                      <Phone size={24} className="text-white rotate-[135deg]" />
                    </button>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
                      <Users size={20} className="text-white" />
                    </button>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
                      <MessageSquare size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
