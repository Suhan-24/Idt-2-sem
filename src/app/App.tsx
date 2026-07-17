import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SplashScreen } from "./components/SplashScreen";
import { Header, type Notification, type UserProfile } from "./components/Header";
import { Hero } from "./components/Hero";
import { DoctorSearch } from "./components/DoctorSearch";
import { AppointmentBooking } from "./components/AppointmentBooking";
import { MyAppointments } from "./components/MyAppointments";
import { PatientDashboard } from "./components/PatientDashboard";
import { Emergency } from "./components/Emergency";
import { VideoConsultation } from "./components/VideoConsultation";
import { MedicineShop } from "./components/MedicineShop";
import { TabletReminder } from "./components/TabletReminder";
import { SymptomChecker } from "./components/SymptomChecker";
import { LiveChat } from "./components/LiveChat";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import type { Lang } from "./i18n/translations";
import type { Appointment } from "./data/types";
import { fetchAppointments } from "./api";
import { Stethoscope } from "lucide-react";

type Screen =
  | "home"
  | "doctors"
  | "booking"
  | "myappointments"
  | "dashboard"
  | "emergency"
  | "video"
  | "medicine"
  | "reminder";

const defaultNotifications: Notification[] = [
  { id: "1", type: "alert", title: "Welcome to MedCare!", message: "Your health platform is ready. Book appointments, consult doctors, and more.", time: "Now", read: false },
  { id: "2", type: "reminder", title: "Medicine Reminder", message: "Metformin 500mg – Time for your morning dose", time: "8:00 AM", read: false },
  { id: "3", type: "appointment", title: "Upcoming Appointment", message: "Dr. Ramesh Iyer – Cardiology – Tomorrow 10:00 AM", time: "Yesterday", read: true },
];

const defaultAppointments: Appointment[] = [];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [screenParam, setScreenParam] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments);
  const [lang, setLang] = useState<Lang>("en");
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function handleLogin(userProfile: UserProfile) {
    setUser(userProfile);
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }

  // Fetch live appointments on mount
  useEffect(() => {
    fetchAppointments()
      .then((data) => setAppointments(data as Appointment[]))
      .catch((err) => console.error("Failed to fetch appointments:", err));
  }, []);

  // Apply accessibility classes to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.classList.toggle("high-contrast", highContrast);
    if (largeText) {
      root.style.fontSize = "18px";
    } else {
      root.style.fontSize = "";
    }
    // Update body background for dark mode
    document.body.style.background = darkMode ? "#0f172a" : "";
  }, [darkMode, highContrast, largeText]);

  function addNotification(n: { type: string; title: string; message: string }) {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type: n.type as Notification["type"],
      title: n.title,
      message: n.message,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function navigate(s: string) {
    // Parse query params
    const [base, param] = s.split("?");
    
    // Auth guard for protected routes
    const protectedRoutes = ["myappointments", "dashboard"];
    if (protectedRoutes.includes(base) && !user) {
      pendingActionRef.current = () => navigate(s);
      setShowLogin(true);
      return;
    }

    setScreen(base as Screen);
    setScreenParam(param || "");
    setSelectedDoctorId("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectDoctor(id: string) {
    if (!user) {
      pendingActionRef.current = () => handleSelectDoctor(id);
      setShowLogin(true);
      return;
    }
    
    setSelectedDoctorId(id);
    setScreen("booking");
    setScreenParam("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBooked(appt: Appointment) {
    setAppointments((prev) => [appt, ...prev]);
    addNotification({
      type: "appointment",
      title: "Appointment Confirmed! ✅",
      message: `${appt.doctorName} — ${new Date(appt.date).toLocaleDateString("en-IN")} at ${appt.slot}`,
    });
  }

  function handleCancelAppointment(id: string) {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
    addNotification({ type: "alert", title: "Appointment Cancelled", message: "Your appointment has been cancelled. Slot is now free." });
  }

  function handleRescheduleAppointment(id: string, newDate: string, newSlot: string) {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, date: newDate, slot: newSlot } : a));
    addNotification({ type: "appointment", title: "Appointment Rescheduled", message: `Rescheduled to ${newDate} at ${newSlot}` });
  }

  // Extract bookedSlots for the booking component
  const bookedSlots = appointments
    .filter((a) => a.status === "upcoming")
    .map((a) => ({ doctorId: a.doctorId, date: a.date, slot: a.slot }));

  // Extract initial query from screenParam
  const initialQuery = screenParam?.startsWith("q=") ? decodeURIComponent(screenParam.slice(2)) : undefined;
  const initialDept = screenParam?.startsWith("dept=") ? screenParam.slice(5) : undefined;

  const appClass = `min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950" : ""}`;

  return (
    <div className={appClass} style={{ fontFamily: "var(--font-body)", fontSize: largeText ? "18px" : undefined }}>
      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Header
            user={user}
            onLogin={handleLogin}
            onLogout={() => setUser(null)}
            notifications={notifications}
            onMarkRead={markRead}
            lang={lang}
            onLangChange={setLang}
            onNavigate={navigate}
            darkMode={darkMode}
            onDarkMode={setDarkMode}
            highContrast={highContrast}
            onHighContrast={setHighContrast}
            largeText={largeText}
            onLargeText={setLargeText}
            currentScreen={screen}
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
          />

          {/* AI Symptom checker floating button */}
          <motion.button
            onClick={() => setShowSymptomChecker(true)}
            className="fixed bottom-24 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #16a34a, #0891b2)", boxShadow: "0 8px 25px rgba(22,163,74,0.35)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            aria-label="Open symptom checker"
          >
            <Stethoscope size={16} /> Symptom Check
          </motion.button>

          <AnimatePresence mode="wait">
            {screen === "home" && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Hero onNavigate={navigate} lang={lang} darkMode={darkMode} />
                <FAQ />
                <Contact />
                <Footer onNavigate={navigate} />
              </motion.div>
            )}

            {screen === "doctors" && (
              <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <DoctorSearch
                  onBack={() => navigate("home")}
                  onSelectDoctor={handleSelectDoctor}
                  lang={lang}
                  darkMode={darkMode}
                  initialQuery={initialQuery}
                />
              </motion.div>
            )}

            {screen === "booking" && selectedDoctorId && (
              <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <AppointmentBooking
                  doctorId={selectedDoctorId}
                  onBack={() => navigate("doctors")}
                  onBooked={handleBooked}
                  bookedSlots={bookedSlots}
                  lang={lang}
                  darkMode={darkMode}
                  userProfile={user ? { name: user.name, mobile: user.mobile } : null}
                />
              </motion.div>
            )}

            {screen === "myappointments" && (
              <motion.div key="myappts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <MyAppointments
                  appointments={appointments}
                  onCancel={handleCancelAppointment}
                  onReschedule={handleRescheduleAppointment}
                  bookedSlots={bookedSlots}
                  onBack={() => navigate("home")}
                  lang={lang}
                  darkMode={darkMode}
                />
              </motion.div>
            )}

            {screen === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <PatientDashboard
                  appointments={appointments}
                  notifications={notifications}
                  onMarkRead={markRead}
                  onBack={() => navigate("home")}
                  onNavigate={navigate}
                  lang={lang}
                  darkMode={darkMode}
                  user={user}
                />
              </motion.div>
            )}

            {screen === "emergency" && (
              <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Emergency onBack={() => navigate("home")} />
              </motion.div>
            )}

            {screen === "video" && (
              <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <VideoConsultation onBack={() => navigate("home")} onNotify={addNotification} />
              </motion.div>
            )}

            {screen === "medicine" && (
              <motion.div key="medicine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <MedicineShop onBack={() => navigate("home")} />
              </motion.div>
            )}

            {screen === "reminder" && (
              <motion.div key="reminder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <TabletReminder onBack={() => navigate("home")} onNotify={addNotification} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating overlays */}
          <AnimatePresence>
            {showSymptomChecker && (
              <SymptomChecker
                onClose={() => setShowSymptomChecker(false)}
                onNavigate={navigate}
                lang={lang}
                darkMode={darkMode}
              />
            )}
          </AnimatePresence>

          <LiveChat lang={lang} darkMode={darkMode} />
        </motion.div>
      )}
    </div>
  );
}
