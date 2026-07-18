import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, MapPin, Phone, ArrowLeft, Truck, Clock, User, CheckCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { requestEmergencyAmbulance } from "../services/api";

// Removed EmergencyProps

const ambulances = [
  {
    id: 1, driver: "Rajan Kumar", vehicle: "KA-05-AB-1234", distance: "1.2 km",
    eta: "4 min", hospital: "Apollo Hospital", phone: "+91 98765 43210", status: "En Route",
  },
  {
    id: 2, driver: "Suresh Nair", vehicle: "MH-12-CD-5678", distance: "2.8 km",
    eta: "8 min", hospital: "Fortis Healthcare", phone: "+91 87654 32109", status: "Available",
  },
  {
    id: 3, driver: "Priya Sharma", vehicle: "DL-04-EF-9012", distance: "3.5 km",
    eta: "11 min", hospital: "Max Hospital", phone: "+91 76543 21098", status: "Available",
  },
];

export function Emergency() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"permission" | "locating" | "found" | "tracking">("permission");
  const [selectedAmbulance, setSelectedAmbulance] = useState(ambulances[0]);
  const [countdown, setCountdown] = useState(180);
  const [location, setLocation] = useState("Detecting...");

  useEffect(() => {
    if (step === "tracking") {
      const interval = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  function handlePermission() {
    setStep("locating");
    setTimeout(() => {
      setLocation("Koramangala, Bengaluru, Karnataka 560034");
      setStep("found");
    }, 2500);
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "linear-gradient(160deg, #fff5f5 0%, #fee2e2 50%, #fff0f0 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-5 text-sm text-slate-600 hover:text-red-600 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          {/* Header card */}
          <div className="rounded-3xl p-6 mb-6 text-white"
            style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)", boxShadow: "0 20px 40px rgba(220,38,38,0.3)" }}>
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <AlertCircle size={32} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Emergency Services</h1>
                <p className="text-red-200 text-sm">24/7 Emergency Response System</p>
              </div>
            </div>
          </div>

          {/* Step: Permission */}
          <AnimatePresence mode="wait">
            {step === "permission" && (
              <motion.div key="perm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl p-8 text-center shadow-lg">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #fee2e2, #fecaca)" }}>
                  <MapPin size={36} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Location Access Required</h2>
                <p className="text-slate-500 mb-6 text-sm">We need your location to find the nearest ambulance and dispatch help quickly.</p>
                <button onClick={handlePermission}
                  className="px-8 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                  Allow Location Access
                </button>
              </motion.div>
            )}

            {step === "locating" && (
              <motion.div key="loc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl p-8 text-center shadow-lg">
                <motion.div
                  className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-500 mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Detecting Your Location</h2>
                <p className="text-slate-500 text-sm">Finding nearby ambulances...</p>
                <div className="mt-4 space-y-2">
                  {["Accessing GPS", "Scanning nearby units", "Calculating routes"].map((t, i) => (
                    <motion.div key={t} className="flex items-center gap-2 text-sm text-slate-500 justify-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.6 }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-red-400"
                        animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.3 }} />
                      {t}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "found" && (
              <motion.div key="found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-3xl p-4 mb-4 shadow-sm flex items-center gap-3">
                  <MapPin size={18} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Your Location</p>
                    <p className="text-sm font-medium text-slate-800">{location}</p>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-800 mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Nearest Ambulances Found
                </h2>

                <div className="space-y-3 mb-6">
                  {ambulances.map((amb) => (
                    <motion.button
                      key={amb.id}
                      onClick={() => setSelectedAmbulance(amb)}
                      className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${selectedAmbulance.id === amb.id ? "border-red-400 bg-red-50" : "border-transparent bg-white"}`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                            <Truck size={18} color="white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{amb.driver}</p>
                            <p className="text-xs text-slate-500">{amb.vehicle} · {amb.hospital}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{amb.eta}</p>
                          <p className="text-xs text-slate-400">{amb.distance} away</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${amb.status === "En Route" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          {amb.status}
                        </span>
                        <span className="text-xs text-slate-500">{amb.phone}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Emergency call button */}
                <motion.button
                  onClick={async () => {
                    try {
                      await requestEmergencyAmbulance({
                        location: location,
                        driver_id: selectedAmbulance.id.toString(),
                        driver_name: selectedAmbulance.driver,
                      });
                      setStep("tracking");
                    } catch (err) {
                      alert("Failed to dispatch ambulance. Please call directly.");
                    }
                  }}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", boxShadow: "0 10px 30px rgba(220,38,38,0.4)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ boxShadow: ["0 10px 30px rgba(220,38,38,0.4)", "0 15px 40px rgba(220,38,38,0.6)", "0 10px 30px rgba(220,38,38,0.4)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Phone size={24} /> CALL AMBULANCE NOW
                </motion.button>
              </motion.div>
            )}

            {step === "tracking" && (
              <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="space-y-4">
                {/* Status card */}
                <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100"
                    style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Truck size={32} color="white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-red-600 mb-1">Ambulance Dispatched!</h2>
                  <p className="text-slate-500 text-sm">Help is on the way</p>

                  <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                    <p className="text-3xl font-bold text-red-600 tabular-nums">{formatTime(countdown)}</p>
                    <p className="text-xs text-slate-500 mt-1">Estimated Arrival</p>
                  </div>
                </div>

                {/* Ambulance details */}
                <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
                  <h3 className="font-semibold text-slate-800">Ambulance Details</h3>
                  {[
                    { icon: User, label: "Driver", value: selectedAmbulance.driver },
                    { icon: Truck, label: "Vehicle", value: selectedAmbulance.vehicle },
                    { icon: MapPin, label: "From", value: selectedAmbulance.hospital },
                    { icon: Clock, label: "ETA", value: selectedAmbulance.eta },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Icon size={16} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-medium text-slate-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call button */}
                <a href={`tel:${selectedAmbulance.phone}`}
                  className="block w-full py-4 rounded-2xl text-white font-bold text-center flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                  <Phone size={20} /> Call Driver: {selectedAmbulance.phone}
                </a>

                <button onClick={() => navigate("/")}
                  className="w-full py-3 rounded-2xl text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                  Return to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
