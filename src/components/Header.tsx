import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Globe, User, LogIn, X, ChevronDown, Check,
  Calendar, Video, Pill, Clock, AlertTriangle, LogOut,
  Menu, Sun, Moon, Contrast, Type, Mic, Volume2,
  LayoutDashboard, BookOpen, MapPin, Loader2
} from "lucide-react";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";

import { useNavigate, useLocation } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

export interface Notification {
  id: string;
  type: "appointment" | "reminder" | "consultation" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  mobile: string;
  age: string;
  place: string;
}

const languages: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "tulu", label: "Tulu", native: "ತುಳು" },
];

const notifIcons: Record<string, React.ReactNode> = {
  appointment: <Calendar size={15} className="text-blue-500" />,
  reminder: <Pill size={15} className="text-green-500" />,
  consultation: <Video size={15} className="text-purple-500" />,
  alert: <AlertTriangle size={15} className="text-orange-500" />,
};

export function Header() {
  const {
    user, setUser, notifications, markRead: onMarkRead,
    lang, setLang: onLangChange,
    darkMode, setDarkMode: onDarkMode,
    highContrast, setHighContrast: onHighContrast,
    largeText, setLargeText: onLargeText,
    userLocation, setUserLocation
  } = useGlobal();

  const navigate = useNavigate();
  const location = useLocation();
  const currentScreen = location.pathname.substring(1) || "home";

  const onNavigate = (section: string) => {
    if (section === "home") navigate("/");
    else navigate(`/${section}`);
  };

  const onLogin = (u: UserProfile) => setUser(u);
  const onLogout = () => setUser(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: "", mobile: "", age: "", place: "" });
  const [formError, setFormError] = useState("");
  const [listening, setListening] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto-detect location on first load
  useEffect(() => {
    if (!userLocation) {
      handleDetectLocation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync userLocation to login form place, but only when opening the modal
  useEffect(() => {
    if (showLogin && userLocation && !loginForm.place) {
      setLoginForm((prev) => ({ ...prev, place: userLocation }));
    }
  }, [showLogin, userLocation, loginForm.place]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginForm.name || !loginForm.mobile || !loginForm.age || !loginForm.place) {
      setFormError("All fields are required");
      return;
    }
    if (!/^\d{10}$/.test(loginForm.mobile)) {
      setFormError("Please enter a valid 10-digit mobile number");
      return;
    }
    onLogin(loginForm);
    setShowLogin(false);
    setLoginForm({ name: "", mobile: "", age: "", place: userLocation || "" });
    setFormError("");
  }

  async function handleDetectLocation(isAuto = false) {
    if (!navigator.geolocation) {
      if (!isAuto) alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            setUserLocation("Unknown Location");
            return;
          }
          
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown Location";
          setUserLocation(city);
        } catch (error) {
          console.error("Geocoding failed:", error);
          // Gracefully fallback instead of alerting on rate-limit/network issues
          setUserLocation("Unknown Location");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (!isAuto) alert("Location access denied or failed.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleVoiceSearch() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      onNavigate("doctors?q=" + encodeURIComponent(transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  const navLinks = [
    { label: t(lang, "home"), section: "home" },
    { label: t(lang, "appointments"), section: "doctors" },
    { label: t(lang, "myAppointments"), section: "myappointments" },
    { label: t(lang, "dashboard"), section: "dashboard" },
    { label: t(lang, "emergency"), section: "emergency" },
    { label: t(lang, "videoConsult"), section: "video" },
    { label: t(lang, "medicine"), section: "medicine" },
  ];

  const glass = darkMode
    ? "rgba(15,23,42,0.9)"
    : "rgba(255,255,255,0.88)";
  const borderCol = darkMode
    ? "rgba(99,179,237,0.15)"
    : "rgba(26,111,212,0.15)";

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 px-3 py-2.5"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-3 py-2"
          style={{
            background: glass,
            backdropFilter: "blur(24px)",
            border: `1px solid ${borderCol}`,
            boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2" aria-label="MedCare Home">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="6" y="1" width="6" height="16" rx="2.5" fill="white" />
                <rect x="1" y="6" width="16" height="6" rx="2.5" fill="white" />
              </svg>
            </div>
            <span className={`text-lg font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
              style={{ fontFamily: "var(--font-display)" }}>
              MedCare
            </span>
          </button>

          {/* Desktop nav (scrollable) */}
          <nav className="hidden lg:flex items-center gap-0.5" role="navigation">
            {navLinks.map((link) => (
              <button
                key={link.section}
                onClick={() => onNavigate(link.section)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${currentScreen === link.section
                  ? "text-white"
                  : darkMode ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                style={currentScreen === link.section ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}
                aria-current={currentScreen === link.section ? "page" : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Location */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => handleDetectLocation(false)}
                disabled={detectingLocation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors text-xs font-medium ${userLocation ? "text-blue-600 bg-blue-50" : darkMode ? "hover:bg-white/10 text-slate-300" : "hover:bg-blue-50 text-slate-600"}`}
                aria-label="Detect Location"
              >
                {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                <span className="max-w-[100px] truncate">{detectingLocation ? "Detecting..." : userLocation || "Location"}</span>
              </button>
            </div>

            {/* Voice search */}
            <motion.button
              onClick={handleVoiceSearch}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${listening ? "bg-red-500" : darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}
              animate={listening ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.6, repeat: listening ? Infinity : 0 }}
              aria-label="Voice search"
              title="Voice Search"
            >
              <Mic size={17} className={listening ? "text-white" : darkMode ? "text-slate-300" : "text-slate-600"} />
            </motion.button>

            {/* Accessibility */}
            <div className="relative">
              <button
                onClick={() => setShowAccessibility(!showAccessibility)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}
                aria-label="Accessibility options"
                title="Accessibility"
              >
                <Type size={16} className={darkMode ? "text-slate-300" : "text-slate-600"} />
              </button>
              <AnimatePresence>
                {showAccessibility && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-10 w-52 rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: darkMode ? "#1e293b" : "white", border: `1px solid ${borderCol}` }}
                  >
                    <div className="p-3 space-y-1">
                      {[
                        { label: t(lang, "darkMode"), icon: darkMode ? Sun : Moon, value: darkMode, setter: onDarkMode, color: "#7c3aed" },
                        { label: t(lang, "highContrast"), icon: Contrast, value: highContrast, setter: onHighContrast, color: "#dc2626" },
                        { label: t(lang, "largeText"), icon: Type, value: largeText, setter: onLargeText, color: "#1a6fd4" },
                      ].map(({ label, icon: Icon, value, setter, color }) => (
                        <button key={label} onClick={() => { setter(!value); setShowAccessibility(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${value ? "text-white" : darkMode ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}
                          style={value ? { background: color } : {}}>
                          <div className="flex items-center gap-2">
                            <Icon size={15} />
                            {label}
                          </div>
                          {value && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); setShowLang(false); setShowProfile(false); }}
                className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
              >
                <Bell size={17} className={darkMode ? "text-slate-300" : "text-slate-600"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ background: "#dc2626" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: darkMode ? "#1e293b" : "white", border: `1px solid ${borderCol}` }}
                  >
                    <div className={`p-3 border-b flex items-center justify-between ${darkMode ? "border-white/10" : "border-blue-50"}`}>
                      <span className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>{t(lang, "notifications")}</span>
                      {unreadCount > 0 && <span className="text-xs text-blue-500 font-medium">{unreadCount} unread</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">No notifications</div>
                      ) : notifications.map((n) => (
                        <div key={n.id}
                          className={`p-3 border-b cursor-pointer flex gap-3 transition-colors ${!n.read ? (darkMode ? "bg-white/5" : "bg-blue-50/40") : ""} ${darkMode ? "border-white/5 hover:bg-white/10" : "border-slate-50 hover:bg-blue-50/50"}`}
                          onClick={() => onMarkRead(n.id)}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? "bg-white/10" : "bg-slate-50"}`}>
                            {notifIcons[n.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${darkMode ? "text-white" : "text-slate-800"}`}>{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => { setShowLang(!showLang); setShowNotif(false); setShowProfile(false); }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-colors text-xs ${darkMode ? "hover:bg-white/10 text-slate-300" : "hover:bg-blue-50 text-slate-600"}`}
                aria-label="Select language"
              >
                <Globe size={14} />
                <span>{languages.find((l) => l.code === lang)?.native}</span>
                <ChevronDown size={11} />
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-10 w-44 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: darkMode ? "#1e293b" : "white", border: `1px solid ${borderCol}` }}
                  >
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { onLangChange(l.code); setShowLang(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${darkMode ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-blue-50"}`}>
                        <div>
                          <span className="font-medium">{l.native}</span>
                          <span className="text-slate-400 text-xs ml-2">{l.label}</span>
                        </div>
                        {lang === l.code && <Check size={13} className="text-blue-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Login / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowLang(false); }}
                  className="flex items-center gap-1.5"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                    {user.name[0].toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-11 w-56 rounded-2xl overflow-hidden shadow-2xl"
                      style={{ background: darkMode ? "#1e293b" : "white", border: `1px solid ${borderCol}` }}
                    >
                      <div className={`p-4 border-b ${darkMode ? "border-white/10" : "border-blue-50"} text-center`}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                          style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{user.name}</p>
                        <p className="text-xs text-slate-400">{user.mobile} · Age {user.age}</p>
                        <p className="text-xs text-slate-400">{user.place}</p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: t(lang, "dashboard"), section: "dashboard" },
                        { icon: BookOpen, label: t(lang, "myAppointments"), section: "myappointments" },
                      ].map(({ icon: Icon, label, section }) => (
                        <button key={section} onClick={() => { onNavigate(section); setShowProfile(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${darkMode ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-blue-50"}`}>
                          <Icon size={15} /> {label}
                        </button>
                      ))}
                      <button onClick={() => { onLogout(); setShowProfile(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-red-50"}`}>
                        <LogOut size={15} /> {t(lang, "logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1a6fd4, #1658b8)" }}
                aria-label="Login"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">{t(lang, "login")}</span>
              </button>
            )}

            {/* Mobile menu */}
            <button className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl"
              onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Menu">
              <Menu size={18} className={darkMode ? "text-slate-300" : "text-slate-600"} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl overflow-hidden"
              style={{ background: darkMode ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)", border: `1px solid ${borderCol}` }}
            >
              {navLinks.map((link) => (
                <button key={link.section} onClick={() => { onNavigate(link.section); setShowMobileMenu(false); }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium border-b last:border-0 transition-colors ${currentScreen === link.section ? "text-blue-600 bg-blue-50/50" : darkMode ? "text-slate-300 border-white/10 hover:bg-white/10" : "text-slate-700 border-slate-100 hover:bg-blue-50"}`}>
                  {link.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
            <motion.div
              className="relative w-full max-w-md rounded-3xl p-8"
              style={{ background: darkMode ? "#1e293b" : "white", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <button onClick={() => setShowLogin(false)}
                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
                <X size={18} className="text-slate-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="10" y="2" width="8" height="24" rx="3" fill="white" />
                    <rect x="2" y="10" width="24" height="8" rx="3" fill="white" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Welcome to MedCare</h2>
                <p className="text-slate-400 text-sm mt-1">Enter your details to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                {[
                  { key: "name", label: "Full Name", placeholder: "Enter your full name", type: "text" },
                  { key: "mobile", label: "Mobile Number", placeholder: "10-digit number", type: "tel" },
                  { key: "age", label: "Age", placeholder: "Your age", type: "number" },
                  { key: "place", label: "City / Place", placeholder: "Your city", type: "text" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={loginForm[f.key as keyof typeof loginForm]}
                      onChange={(e) => setLoginForm({ ...loginForm, [f.key]: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-400 ${darkMode ? "bg-white/10 border-white/20 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`} />
                  </div>
                ))}
                {formError && <p className="text-red-500 text-xs">{formError}</p>}
                <button type="submit"
                  className="w-full py-3 rounded-2xl text-white font-semibold text-sm mt-1 transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                  Continue to MedCare
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
