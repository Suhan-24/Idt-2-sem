import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Plus, Trash2, Bell, CheckCircle, X } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

// Removed TabletReminderProps

interface Reminder {
  id: string;
  tablet: string;
  dosage: string;
  time: string;
  frequency: string;
  notes: string;
  taken: boolean;
}

const frequencies = ["Once daily", "Twice daily", "Three times daily", "Every 4 hours", "Every 6 hours", "Every 8 hours", "Weekly", "As needed"];

export function TabletReminder() {
  const navigate = useNavigate();
  const { addNotification: onNotify } = useGlobal();
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", tablet: "Metformin 500mg", dosage: "1 tablet", time: "08:00", frequency: "Twice daily", notes: "Take with food", taken: false },
    { id: "2", tablet: "Vitamin D3", dosage: "1 tablet", time: "09:00", frequency: "Once daily", notes: "Take after breakfast", taken: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [showAlert, setShowAlert] = useState<Reminder | null>(null);
  const [form, setForm] = useState({ tablet: "", dosage: "", time: "", frequency: frequencies[0], notes: "" });
  const [success, setSuccess] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const newReminder: Reminder = { ...form, id: Date.now().toString(), taken: false };
    setReminders([...reminders, newReminder]);
    onNotify({ type: "reminder", title: "Reminder Set!", message: `${form.tablet} at ${form.time} — ${form.frequency}` });
    setForm({ tablet: "", dosage: "", time: "", frequency: frequencies[0], notes: "" });
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function toggleTaken(id: string) {
    setReminders((r) => r.map((rem) => rem.id === id ? { ...rem, taken: !rem.taken } : rem));
  }

  function deleteReminder(id: string) {
    setReminders((r) => r.filter((rem) => rem.id !== id));
  }

  function simulateAlert(rem: Reminder) {
    setShowAlert(rem);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "linear-gradient(160deg, #fffbeb 0%, #fff7ed 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={18} /> Back
          </button>

          {/* Header */}
          <div className="rounded-3xl p-5 mb-5 text-white flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 12px 30px rgba(217,119,6,0.3)" }}>
            <div className="flex items-center gap-3">
              <Clock size={28} />
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Tablet Reminder</h1>
                <p className="text-amber-100 text-sm">Never miss a dose again</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium">
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Success toast */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-2xl flex items-center gap-2 text-sm"
                style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", color: "#16a34a" }}>
                <CheckCircle size={16} /> Reminder saved successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reminders list */}
          {reminders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
              <Clock size={48} className="mx-auto mb-3 text-amber-300" />
              <p className="text-slate-500">No reminders yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <h2 className="font-bold text-slate-800 mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Your Reminders ({reminders.length})
              </h2>
              {reminders.map((rem, i) => (
                <motion.div key={rem.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${rem.taken ? "border-green-100 opacity-70" : "border-transparent"}`}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${rem.taken ? "bg-green-100" : "bg-amber-100"}`}>
                      {rem.taken ? <CheckCircle size={22} className="text-green-500" /> : <span className="text-xl">💊</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${rem.taken ? "line-through text-slate-400" : "text-slate-800"}`}>{rem.tablet}</h3>
                        {rem.taken && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Taken</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{rem.dosage} · {rem.frequency}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Clock size={11} /> {rem.time}
                        </span>
                        {rem.notes && <span className="text-xs text-slate-400">{rem.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => simulateAlert(rem)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                        <Bell size={14} className="text-amber-600" />
                      </button>
                      <button onClick={() => toggleTaken(rem.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${rem.taken ? "bg-green-50 hover:bg-green-100" : "bg-slate-50 hover:bg-slate-100"}`}>
                        <CheckCircle size={14} className={rem.taken ? "text-green-500" : "text-slate-400"} />
                      </button>
                      <button onClick={() => deleteReminder(rem.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upcoming schedule */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>Today's Schedule</h3>
            <div className="space-y-2">
              {[...reminders].sort((a, b) => a.time.localeCompare(b.time)).map((rem) => (
                <div key={rem.id} className="flex items-center gap-3 p-2">
                  <div className={`w-2 h-2 rounded-full ${rem.taken ? "bg-green-400" : "bg-amber-400"}`} />
                  <span className="text-sm font-mono text-slate-500 w-14">{rem.time}</span>
                  <span className={`text-sm flex-1 ${rem.taken ? "line-through text-slate-400" : "text-slate-700"}`}>{rem.tablet}</span>
                  <span className="text-xs text-slate-400">{rem.dosage}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6"
              style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Set New Reminder</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {[
                  { key: "tablet", label: "Tablet Name", type: "text", placeholder: "e.g. Paracetamol 500mg" },
                  { key: "dosage", label: "Dosage", type: "text", placeholder: "e.g. 1 tablet, 2 capsules" },
                  { key: "time", label: "Reminder Time", type: "time", placeholder: "" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-amber-400 bg-slate-50"
                      style={{ borderColor: "rgba(217,119,6,0.2)" }} required />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-amber-400 bg-slate-50"
                    style={{ borderColor: "rgba(217,119,6,0.2)" }}>
                    {frequencies.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                  <textarea placeholder="e.g. Take with food, avoid milk..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-amber-400 bg-slate-50 resize-none"
                    style={{ borderColor: "rgba(217,119,6,0.2)" }} />
                </div>

                <button type="submit"
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
                  <Bell size={16} /> Set Reminder
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAlert(null)} />
            <motion.div className="relative w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: "white" }}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <motion.div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Bell size={28} className="text-white" />
              </motion.div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Medicine Reminder! 💊</h3>
              <p className="text-slate-600 font-medium">{showAlert.tablet}</p>
              <p className="text-slate-400 text-sm mt-1">{showAlert.dosage} · {showAlert.time}</p>
              {showAlert.notes && <p className="text-slate-500 text-xs mt-2 italic">"{showAlert.notes}"</p>}
              <div className="flex gap-3 mt-5">
                <button onClick={() => { toggleTaken(showAlert.id); setShowAlert(null); }}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                  ✓ Taken
                </button>
                <button onClick={() => setShowAlert(null)}
                  className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold text-sm border border-slate-200">
                  Snooze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
