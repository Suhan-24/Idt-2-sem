import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { GlobalProvider, useGlobal } from "./context/GlobalContext";

import { SplashScreen } from "./components/SplashScreen";
import { Header } from "./components/Header";
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
import { Stethoscope } from "lucide-react";

function AppContent() {
  const { darkMode, largeText } = useGlobal();
  const [showSplash, setShowSplash] = useState(true);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const location = useLocation();

  const appClass = `min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950" : ""}`;

  return (
    <div className={appClass} style={{ fontFamily: "var(--font-body)", fontSize: largeText ? "18px" : undefined }}>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Header />

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
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Hero />
                  <FAQ />
                  <Contact />
                  <Footer />
                </motion.div>
              } />
              <Route path="/doctors" element={
                <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <DoctorSearch />
                </motion.div>
              } />
              <Route path="/booking" element={
                <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <AppointmentBooking />
                </motion.div>
              } />
              <Route path="/myappointments" element={
                <motion.div key="myappts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <MyAppointments />
                </motion.div>
              } />
              <Route path="/dashboard" element={
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <PatientDashboard />
                </motion.div>
              } />
              <Route path="/emergency" element={
                <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Emergency />
                </motion.div>
              } />
              <Route path="/video" element={
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <VideoConsultation />
                </motion.div>
              } />
              <Route path="/medicine" element={
                <motion.div key="medicine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <MedicineShop />
                </motion.div>
              } />
              <Route path="/reminder" element={
                <motion.div key="reminder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <TabletReminder />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>

          <AnimatePresence>
            {showSymptomChecker && (
              <SymptomChecker onClose={() => setShowSymptomChecker(false)} />
            )}
          </AnimatePresence>

          <LiveChat />
        </motion.div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GlobalProvider>
  );
}
