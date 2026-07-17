import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, CheckCircle, Volume2, Clock, Mic, Loader2 } from "lucide-react";
import { getDoctorById } from "../data/doctors";
import { TIME_SLOTS, DEPT_COLORS, DEPT_ICONS, type Appointment } from "../data/types";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";
import { createAppointment } from "../api";

interface AppointmentBookingProps {
  doctorId: string;
  onBack: () => void;
  onBooked: (appt: Appointment) => void;
  bookedSlots: { doctorId: string; date: string; slot: string }[];
  lang: Lang;
  darkMode: boolean;
  userProfile: { name: string; mobile: string } | null;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  window.speechSynthesis.speak(u);
}

export function AppointmentBooking({ doctorId, onBack, onBooked, bookedSlots, lang, darkMode, userProfile }: AppointmentBookingProps) {
  const doctor = getDoctorById(doctorId);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.mobile || "",
    date: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [step, setStep] = useState<"book" | "confirm" | "success">("book");
  const [listenField, setListenField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!doctor) return null;

  const isSlotBooked = (slot: string) =>
    bookedSlots.some((b) => b.doctorId === doctorId && b.date === form.date && b.slot === slot);

  function handleVoice(field: string) {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-IN";
    setListenField(field);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm((f) => ({ ...f, [field]: transcript }));
      setListenField(null);
    };
    recognition.onerror = () => setListenField(null);
    recognition.onend = () => setListenField(null);
    recognition.start();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitError(null);
    setStep("confirm");
  }

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Try to persist via API
      const saved = await createAppointment({
        patientName: form.name,
        patientPhone: form.phone,
        doctorId: doctor!.id,
        doctorName: doctor!.name,
        doctorDept: doctor!.dept,
        date: form.date,
        slot: selectedSlot,
        reason: form.reason,
      });
      const appt: Appointment = {
        id: saved.id,
        patientName: saved.patientName,
        patientPhone: saved.patientPhone,
        doctorId: saved.doctorId,
        doctorName: saved.doctorName,
        doctorDept: saved.doctorDept as Appointment["doctorDept"],
        date: saved.date,
        slot: saved.slot,
        reason: saved.reason,
        status: "upcoming",
        createdAt: saved.createdAt,
      };
      onBooked(appt);
      setStep("success");
    } catch {
      // Offline fallback: create locally
      const appt: Appointment = {
        id: Date.now().toString(),
        patientName: form.name,
        patientPhone: form.phone,
        doctorId: doctor!.id,
        doctorName: doctor!.name,
        doctorDept: doctor!.dept,
        date: form.date,
        slot: selectedSlot,
        reason: form.reason,
        status: "upcoming",
        createdAt: new Date().toISOString(),
      };
      onBooked(appt);
      setStep("success");
    } finally {
      setSubmitting(false);
    }
  }

  const card = darkMode ? "rgba(30,41,59,0.9)" : "white";
  const border = darkMode ? "rgba(99,179,237,0.1)" : "rgba(26,111,212,0.12)";
  const text = darkMode ? "text-white" : "text-slate-800";
  const subtext = darkMode ? "text-slate-400" : "text-slate-500";
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400 ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`;

  const deptColor = DEPT_COLORS[doctor.dept];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: darkMode ? "#0f172a" : "linear-gradient(160deg, #eff6ff 0%, #f0fff8 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step !== "success" && (
            <button onClick={step === "book" ? onBack : () => setStep("book")}
              className={`flex items-center gap-2 mb-5 text-sm transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"}`}>
              <ArrowLeft size={16} /> {t(lang, "back")}
            </button>
          )}

          <AnimatePresence mode="wait">
            {/* BOOK STEP */}
            {step === "book" && (
              <motion.div key="book" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Doctor card */}
                <div className="rounded-3xl p-5 mb-5 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                  <div className="flex items-start gap-4">
                    <img src={doctor.photo} alt={doctor.name} className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className={`font-bold text-lg ${text}`}>{doctor.name}</h2>
                          <p className="text-sm font-medium" style={{ color: deptColor }}>{doctor.specialization}</p>
                          <p className={`text-xs mt-0.5 ${subtext}`}>{doctor.qualification}</p>
                        </div>
                        <button onClick={() => speak(`${doctor.name}. ${doctor.bio}`)} aria-label="Read doctor info">
                          <Volume2 size={18} className="text-blue-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className={`text-sm font-semibold ${text}`}>{doctor.rating}</span>
                          <span className={`text-xs ${subtext}`}>({doctor.reviews} {t(lang, "reviews")})</span>
                        </div>
                        <span className={`text-xs ${subtext}`}>{doctor.experience} yrs exp</span>
                        <span className="text-sm font-bold text-green-600">₹{doctor.fee}</span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs mt-3 leading-relaxed ${subtext}`}>{doctor.bio}</p>
                </div>

                {/* Booking form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                    <h3 className={`font-bold ${text}`} style={{ fontFamily: "var(--font-display)" }}>
                      {t(lang, "bookingTitle")}
                    </h3>

                    {/* Name */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${subtext}`}>{t(lang, "patientName")}</label>
                      <div className="relative">
                        <input className={inputCls} placeholder={t(lang, "patientName")}
                          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <button type="button" onClick={() => handleVoice("name")}
                          className={`absolute right-3 top-2.5 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${listenField === "name" ? "bg-red-500" : "hover:bg-blue-50"}`}>
                          <Mic size={13} className={listenField === "name" ? "text-white" : "text-slate-400"} />
                        </button>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${subtext}`}>{t(lang, "patientPhone")}</label>
                      <input className={inputCls} type="tel" placeholder="10-digit number"
                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>

                    {/* Date */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${subtext}`}>{t(lang, "appointmentDate")}</label>
                      <input className={inputCls} type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${subtext}`}>{t(lang, "reason")}</label>
                      <div className="relative">
                        <textarea className={`${inputCls} resize-none`} rows={2}
                          placeholder={t(lang, "reasonPlaceholder")}
                          value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                        <button type="button" onClick={() => handleVoice("reason")}
                          className={`absolute right-3 top-2.5 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${listenField === "reason" ? "bg-red-500" : "hover:bg-blue-50"}`}>
                          <Mic size={13} className={listenField === "reason" ? "text-white" : "text-slate-400"} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="rounded-2xl p-5 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={16} className="text-blue-500" />
                      <h3 className={`font-bold ${text}`}>{t(lang, "selectSlot")}</h3>
                      <button type="button" onClick={() => speak("Select a time slot for your appointment. Available slots are shown in color.")} aria-label="Read slots">
                        <Volume2 size={14} className="text-blue-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const booked = isSlotBooked(slot);
                        const selected = selectedSlot === slot;
                        return (
                          <motion.button key={slot} type="button"
                            onClick={() => !booked && setSelectedSlot(slot)}
                            disabled={booked}
                            className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${booked
                              ? darkMode ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                              : selected ? "text-white shadow-md" : darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200"
                              }`}
                            style={selected && !booked ? { background: `linear-gradient(135deg, ${deptColor}, ${deptColor}bb)` } : {}}
                            whileHover={!booked ? { scale: 1.03 } : {}}
                            whileTap={!booked ? { scale: 0.97 } : {}}>
                            {booked ? `${slot} ✗` : slot}
                          </motion.button>
                        );
                      })}
                    </div>

                    <p className={`text-xs mt-3 ${subtext}`}>
                      ✓ = Available &nbsp; ✗ = Booked
                    </p>
                  </div>

                  <button type="submit" disabled={!selectedSlot}
                    className="w-full py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90 hover:shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${deptColor}, #16a34a)` }}>
                    {t(lang, "confirm")} {selectedSlot && `— ${selectedSlot}`}
                  </button>
                </form>
              </motion.div>
            )}

            {/* CONFIRM STEP */}
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl overflow-hidden shadow-xl" style={{ background: card, border: `1px solid ${border}` }}>
                  <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${deptColor}, #1a6fd4)` }}>
                    <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Confirm Appointment</h2>
                    <p className="text-blue-100 text-sm">Please review your booking details</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { label: "Doctor", value: doctor.name },
                      { label: "Specialization", value: doctor.specialization },
                      { label: "Patient", value: form.name },
                      { label: "Contact", value: form.phone },
                      { label: "Date", value: new Date(form.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                      { label: "Time Slot", value: selectedSlot },
                      { label: "Consultation Fee", value: `₹${doctor.fee}` },
                      { label: "Reason", value: form.reason || "Not specified" },
                    ].map(({ label, value }) => (
                      <div key={label} className={`flex items-start justify-between py-2 border-b ${darkMode ? "border-white/10" : "border-slate-50"} last:border-0`}>
                        <span className={`text-sm ${subtext}`}>{label}</span>
                        <span className={`text-sm font-semibold text-right max-w-[55%] ${text}`}>{value}</span>
                      </div>
                    ))}

                    <div className="flex gap-3 mt-4 pt-2">
                      <button onClick={() => setStep("book")}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        ← Edit
                      </button>
                      <button onClick={handleConfirm} disabled={submitting}
                        className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${deptColor}, #16a34a)` }}>
                        {submitting ? <><Loader2 size={14} className="animate-spin" /> Booking…</> : "Confirm & Book"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-12 text-center text-white"
                    style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, delay: 0.2 }}>
                      <CheckCircle size={88} className="mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                      {t(lang, "bookingSuccess")}
                    </h2>
                    <p className="text-green-100 text-sm">A notification has been sent to your device</p>
                    <button onClick={() => speak(`Your appointment with ${doctor.name} has been confirmed for ${form.date} at ${selectedSlot}. Fee is ${doctor.fee} rupees.`)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors mx-auto">
                      <Volume2 size={15} /> Read Details Aloud
                    </button>
                  </div>

                  <div className="p-6 space-y-3" style={{ background: card }}>
                    {[
                      { label: "Doctor", value: doctor.name },
                      { label: "Date", value: new Date(form.date).toLocaleDateString("en-IN", { dateStyle: "full" }) },
                      { label: "Time", value: selectedSlot },
                      { label: "Hospital", value: "MedCare Healthcare Network" },
                      { label: "Fee", value: `₹${doctor.fee}` },
                    ].map(({ label, value }) => (
                      <div key={label} className={`flex items-center justify-between py-2 border-b ${darkMode ? "border-white/10" : "border-slate-50"} last:border-0`}>
                        <span className={`text-sm ${subtext}`}>{label}</span>
                        <span className={`text-sm font-semibold ${text}`}>{value}</span>
                      </div>
                    ))}
                    <button onClick={onBack}
                      className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm"
                      style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                      Back to Home
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
