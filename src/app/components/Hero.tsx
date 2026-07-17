import { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle, Calendar, Video, ShoppingBag, Clock,
  Search, Star, Shield, Heart, Mic
} from "lucide-react";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";

interface HeroProps {
  onNavigate: (section: string) => void;
  lang: Lang;
  darkMode: boolean;
}

const services = [
  { id: "emergency", icon: AlertCircle, label: "Emergency", desc: "Instant ambulance & help", color: "#dc2626", bg: "linear-gradient(135deg, #dc2626, #b91c1c)", glow: "rgba(220,38,38,0.2)", badge: "24/7" },
  { id: "doctors", icon: Calendar, label: "Book Appointment", desc: "Find & book doctors", color: "#1a6fd4", bg: "linear-gradient(135deg, #1a6fd4, #1658b8)", glow: "rgba(26,111,212,0.2)", badge: "Nearby" },
  { id: "video", icon: Video, label: "Video Consult", desc: "See a doctor online", color: "#7c3aed", bg: "linear-gradient(135deg, #7c3aed, #6d28d9)", glow: "rgba(124,58,237,0.2)", badge: "Instant" },
  { id: "medicine", icon: ShoppingBag, label: "Shop Medicine", desc: "Order medicines online", color: "#16a34a", bg: "linear-gradient(135deg, #16a34a, #15803d)", glow: "rgba(22,163,74,0.2)", badge: "Delivery" },
  { id: "reminder", icon: Clock, label: "Tablet Reminder", desc: "Never miss a dose", color: "#d97706", bg: "linear-gradient(135deg, #d97706, #b45309)", glow: "rgba(217,119,6,0.2)", badge: "Smart" },
];

const testimonials = [
  { name: "Meena R.", city: "Bengaluru", rating: 5, text: "MedCare made booking my cardiac appointment so easy. The doctor was excellent and the video call was crystal clear!" },
  { name: "Harish K.", city: "Mangaluru", rating: 5, text: "Emergency ambulance arrived in 6 minutes! The app tracked the driver in real time. Truly life-saving service." },
  { name: "Lakshmi P.", city: "Udupi", rating: 5, text: "I love the Kannada language support. Tablet reminders make sure I never miss my medicine. Excellent platform!" },
  { name: "Suresh N.", city: "Mysuru", rating: 5, text: "Booked a neurology appointment for my father within minutes. Clean interface and very professional doctors." },
];

const trustBadges = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Star, label: "4.9★ Rating" },
  { icon: Heart, label: "50K+ Patients" },
];

export function Hero({ onNavigate, lang, darkMode }: HeroProps) {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onNavigate("doctors" + (query ? "?q=" + encodeURIComponent(query) : ""));
  }

  function handleVoiceSearch() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  }

  const bg = darkMode
    ? "linear-gradient(160deg, #0d1b3e 0%, #0d2d6e 50%, #0a1a2e 100%)"
    : "linear-gradient(160deg, #e8f2ff 0%, #f0fff8 50%, #eff6ff 100%)";

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen pt-28 pb-16 overflow-hidden" style={{ background: bg }}>
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #1a6fd4, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #16a34a, transparent)", filter: "blur(80px)" }} />

        {/* Floating emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["💊", "🩺", "🏥", "💉", "❤️"].map((emoji, i) => (
            <motion.div key={i} className="absolute text-4xl opacity-5"
              style={{ left: `${10 + i * 22}%`, top: `${20 + (i % 2) * 40}%` }}
              animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}>
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Headline */}
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: "rgba(26,111,212,0.12)", color: "#1a6fd4" }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              ✦ {t(lang, "heroTagline")}
            </motion.span>

            <motion.h1
              className={`text-4xl md:text-6xl font-extrabold mb-4 leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {t(lang, "heroHeadline")}
            </motion.h1>

            <motion.p
              className={`text-lg md:text-xl max-w-2xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {t(lang, "heroSub")}
            </motion.p>
          </motion.div>

          {/* Search bar */}
          <motion.form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center gap-2 p-2 rounded-2xl shadow-xl"
              style={{ background: darkMode ? "rgba(30,41,59,0.9)" : "white", border: `1px solid ${darkMode ? "rgba(99,179,237,0.2)" : "rgba(26,111,212,0.15)"}` }}>
              <Search size={18} className="ml-2 text-slate-400 shrink-0" />
              <input
                className={`flex-1 px-2 py-2 text-sm outline-none bg-transparent ${darkMode ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
                placeholder={t(lang, "searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search doctors"
              />
              <button type="button" onClick={handleVoiceSearch}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-colors" aria-label="Voice search">
                <Mic size={16} className="text-slate-400" />
              </button>
              <button type="submit"
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                {t(lang, "searchBtn")}
              </button>
            </div>
          </motion.form>

          {/* CTA row */}
          <motion.div className="flex items-center justify-center gap-3 mb-12"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <button onClick={() => onNavigate("doctors")}
              className="px-6 py-3 rounded-2xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
              <Calendar size={16} /> {t(lang, "bookNow")}
            </button>
            <button onClick={() => onNavigate("emergency")}
              className="px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-105">
              <AlertCircle size={16} /> {t(lang, "emergencyBtn")}
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div className="flex items-center justify-center gap-6 mb-12 flex-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className={`flex items-center gap-1.5 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                <Icon size={14} className="text-blue-500" />
                {label}
              </div>
            ))}
          </motion.div>

          {/* Service Cards */}
          <h2 className={`text-center text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-800"}`}
            style={{ fontFamily: "var(--font-display)" }}>
            {t(lang, "services")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.button key={service.id} onClick={() => onNavigate(service.id)}
                  className="relative group flex flex-col items-center gap-3 p-5 rounded-3xl cursor-pointer"
                  style={{
                    background: darkMode ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${darkMode ? "rgba(99,179,237,0.1)" : "rgba(255,255,255,0.8)"}`,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  }}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}
                  whileHover={{ y: -6, boxShadow: `0 20px 40px ${service.glow}` }}
                  whileTap={{ scale: 0.97 }}>
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: service.color }}>{service.badge}</span>
                  <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: service.bg }}
                    whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                    <Icon size={28} color="white" strokeWidth={1.5} />
                  </motion.div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}
                      style={{ fontFamily: "var(--font-display)" }}>{service.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{service.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Stats row */}
          <motion.div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            {[
              { value: "50,000+", label: "Patients Served" },
              { value: "1,200+", label: "Verified Doctors" },
              { value: "500+", label: "Partner Hospitals" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl"
                style={{ background: darkMode ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(26,111,212,0.1)" }}>
                <p className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "#1a6fd4" }}>{stat.value}</p>
                <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4" style={{ background: darkMode ? "#0f172a" : "#f8faff" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-3"
              style={{ background: "rgba(26,111,212,0.1)", color: "#1a6fd4" }}>★ Testimonials</span>
            <h2 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
              style={{ fontFamily: "var(--font-display)" }}>
              {t(lang, "testimonialsTitle")}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((tm, i) => (
              <motion.div key={i}
                className="p-5 rounded-2xl"
                style={{ background: darkMode ? "rgba(30,41,59,0.8)" : "white", border: `1px solid ${darkMode ? "rgba(99,179,237,0.1)" : "rgba(26,111,212,0.08)"}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(tm.rating)].map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>"{tm.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                    {tm.name[0]}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{tm.name}</p>
                    <p className="text-xs text-slate-400">{tm.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
