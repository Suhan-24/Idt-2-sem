import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Calendar, Clock, User, Stethoscope, X, RefreshCw, CheckCircle, Volume2, Filter } from "lucide-react";
import { getDoctorById } from "../data/doctors";
import { TIME_SLOTS, DEPT_COLORS, DEPT_ICONS, type Appointment } from "../data/types";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";
import { patchAppointment, cancelAppointment } from "../services/api";

import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  window.speechSynthesis.speak(u);
}

export function MyAppointments() {
  const { lang, darkMode, appointments, bookedSlots, handleCancelAppointment: onCancel, handleRescheduleAppointment: onReschedule } = useGlobal();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  const filtered = appointments.filter((a) => a.status === activeTab);

  const card = darkMode ? "rgba(30,41,59,0.9)" : "white";
  const border = darkMode ? "rgba(99,179,237,0.1)" : "rgba(26,111,212,0.1)";
  const text = darkMode ? "text-white" : "text-slate-800";
  const subtext = darkMode ? "text-slate-400" : "text-slate-500";

  async function handleCancel(id: string) {
    try {
      await cancelAppointment(id);
      onCancel(id);
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancelTarget(null);
    }
  }

  async function handleReschedule() {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleSlot) return;
    try {
      await patchAppointment(rescheduleTarget.id, { date: rescheduleDate, slot: rescheduleSlot });
      onReschedule(rescheduleTarget.id, rescheduleDate, rescheduleSlot);
      setRescheduleSuccess(true);
      setTimeout(() => {
        setRescheduleTarget(null);
        setRescheduleDate("");
        setRescheduleSlot("");
        setRescheduleSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Failed to reschedule appointment");
    }
  }

  const isSlotBooked = (appt: Appointment, slot: string) =>
    bookedSlots.some((b) => b.doctorId === appt.doctorId && b.date === rescheduleDate && b.slot === slot && !(b.doctorId === appt.doctorId && b.date === appt.date && b.slot === appt.slot));

  const tabs: { id: "upcoming" | "completed" | "cancelled"; label: string; color: string }[] = [
    { id: "upcoming", label: t(lang, "upcoming"), color: "#1a6fd4" },
    { id: "completed", label: t(lang, "completed"), color: "#16a34a" },
    { id: "cancelled", label: t(lang, "cancelled"), color: "#dc2626" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: darkMode ? "#0f172a" : "linear-gradient(160deg, #eff6ff 0%, #f0fff8 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 mb-5 text-sm transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"}`}>
            <ArrowLeft size={16} /> {t(lang, "back")}
          </button>

          {/* Header */}
          <div className="rounded-3xl p-5 mb-5 text-white"
            style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)", boxShadow: "0 12px 30px rgba(26,111,212,0.3)" }}>
            <div className="flex items-center gap-3">
              <Calendar size={26} />
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{t(lang, "myApptTitle")}</h1>
                <p className="text-blue-100 text-sm">{appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {tabs.map((tab) => {
              const count = appointments.filter((a) => a.status === tab.id).length;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? "text-white shadow-md" : darkMode ? "text-slate-400 bg-slate-800" : "text-slate-500 bg-white border border-slate-100"}`}
                  style={activeTab === tab.id ? { background: tab.color } : {}}>
                  {tab.label}
                  {count > 0 && <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${activeTab === tab.id ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"}`}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Appointment list */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={48} className={`mx-auto mb-3 ${darkMode ? "text-slate-600" : "text-slate-300"}`} />
                  <p className={`font-medium ${subtext}`}>No {activeTab} appointments</p>
                  {activeTab === "upcoming" && (
                    <button onClick={onBack} className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-medium"
                      style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                      Book an Appointment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((appt, i) => {
                    const doc = getDoctorById(appt.doctorId);
                    const deptColor = DEPT_COLORS[appt.doctorDept];
                    return (
                      <motion.div key={appt.id}
                        className="rounded-2xl overflow-hidden shadow-sm"
                        style={{ background: card, border: `1px solid ${border}` }}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        {/* Status bar */}
                        <div className="h-1" style={{ background: appt.status === "upcoming" ? "#1a6fd4" : appt.status === "completed" ? "#16a34a" : "#dc2626" }} />

                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                              style={{ background: `${deptColor}18` }}>
                              {DEPT_ICONS[appt.doctorDept]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className={`font-bold ${text}`}>{appt.doctorName}</h3>
                                  <p className="text-xs" style={{ color: deptColor }}>{appt.doctorDept.charAt(0).toUpperCase() + appt.doctorDept.slice(1)}</p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${appt.status === "upcoming" ? "bg-blue-100 text-blue-600" : appt.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                                  {t(lang, appt.status)}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-3 mt-3">
                                <div className={`flex items-center gap-1 text-xs ${subtext}`}>
                                  <Calendar size={12} />
                                  {new Date(appt.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${subtext}`}>
                                  <Clock size={12} /> {appt.slot}
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${subtext}`}>
                                  <User size={12} /> {appt.patientName}
                                </div>
                              </div>

                              {appt.reason && (
                                <p className={`text-xs mt-2 ${subtext}`}>Reason: {appt.reason}</p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {appt.status === "upcoming" && (
                            <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#f0f9ff" }}>
                              <button
                                onClick={() => speak(`Your appointment with ${appt.doctorName} is on ${appt.date} at ${appt.slot}.`)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}>
                                <Volume2 size={14} className="text-blue-400" />
                              </button>
                              <button
                                onClick={() => { setRescheduleTarget(appt); setRescheduleDate(appt.date); setRescheduleSlot(""); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${darkMode ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                                <RefreshCw size={12} /> {t(lang, "reschedule")}
                              </button>
                              <button
                                onClick={() => setCancelTarget(appt.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                                <X size={12} /> {t(lang, "cancel")}
                              </button>
                            </div>
                          )}

                          {appt.status === "completed" && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t text-green-500 text-xs font-medium"
                              style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#f0fdf4" }}>
                              <CheckCircle size={14} /> Appointment completed
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
            <motion.div className="relative w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: darkMode ? "#1e293b" : "white" }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X size={28} className="text-red-500" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${text}`}>Cancel Appointment?</h3>
              <p className={`text-sm mb-6 ${subtext}`}>{t(lang, "cancelConfirm")}</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelTarget(null)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {t(lang, "cancelNo")}
                </button>
                <button onClick={() => handleCancel(cancelTarget)}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold bg-red-500 hover:bg-red-600 transition-colors">
                  {t(lang, "cancelYes")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)} />
            <motion.div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl"
              style={{ background: darkMode ? "#1e293b" : "white" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}>
              <div className="p-5 border-b flex items-center justify-between"
                style={{ borderColor: darkMode ? "rgba(255,255,255,0.1)" : "#f0f9ff" }}>
                <h3 className={`font-bold ${text}`}>{t(lang, "reschedule")}</h3>
                <button onClick={() => setRescheduleTarget(null)}>
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              {rescheduleSuccess ? (
                <div className="p-8 text-center">
                  <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                  <p className={`font-bold ${text}`}>{t(lang, "apptRescheduled")}</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>New Date</label>
                    <input type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={rescheduleDate}
                      onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleSlot(""); }}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </div>
                  {rescheduleDate && (
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>New Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((slot) => {
                          const busy = isSlotBooked(rescheduleTarget, slot);
                          const sel = rescheduleSlot === slot;
                          return (
                            <button key={slot} type="button"
                              onClick={() => !busy && setRescheduleSlot(slot)}
                              disabled={busy}
                              className={`py-2 rounded-xl text-xs font-medium transition-all ${busy ? darkMode ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-slate-100 text-slate-300 cursor-not-allowed" : sel ? "text-white" : darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200"}`}
                              style={sel && !busy ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}>
                              {busy ? `${slot} ✗` : slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button onClick={handleReschedule}
                    disabled={!rescheduleDate || !rescheduleSlot}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" }}>
                    Confirm Reschedule {rescheduleSlot && `— ${rescheduleSlot}`}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
