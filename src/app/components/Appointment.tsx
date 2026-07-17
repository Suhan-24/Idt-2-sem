import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MapPin, Star, Phone, Clock, CheckCircle, Calendar, ChevronRight, User } from "lucide-react";

interface AppointmentProps {
  onBack: () => void;
  onNotify: (n: { type: string; title: string; message: string }) => void;
}

const hospitals = [
  {
    id: 1, name: "Apollo Hospitals", location: "Bannerghatta Road, Bengaluru",
    rating: 4.8, reviews: 2340, phone: "+91 80 2630 4050", distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop&auto=format",
    doctors: [
      { name: "Dr. Ramesh Iyer", spec: "Cardiology", exp: "15 yrs", fee: "₹800", slots: ["09:00", "10:30", "11:00", "14:00", "15:30"], busy: ["10:30"] },
      { name: "Dr. Priya Nair", spec: "Orthopedics", exp: "10 yrs", fee: "₹600", slots: ["09:30", "11:00", "14:30", "16:00"], busy: ["09:30"] },
      { name: "Dr. Sunita Rao", spec: "General Physician", exp: "8 yrs", fee: "₹400", slots: ["09:00", "10:00", "11:30", "14:00", "15:00", "16:30"], busy: [] },
    ],
  },
  {
    id: 2, name: "Fortis Hospital", location: "Cunningham Road, Bengaluru",
    rating: 4.6, reviews: 1870, phone: "+91 80 4696 9999", distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop&auto=format",
    doctors: [
      { name: "Dr. Anand Sharma", spec: "Neurology", exp: "20 yrs", fee: "₹1200", slots: ["10:00", "11:30", "15:00"], busy: [] },
      { name: "Dr. Meera Pillai", spec: "Gynecology", exp: "12 yrs", fee: "₹700", slots: ["09:00", "10:30", "14:00", "15:30"], busy: ["10:30"] },
    ],
  },
  {
    id: 3, name: "Manipal Hospitals", location: "Old Airport Road, Bengaluru",
    rating: 4.7, reviews: 3100, phone: "+91 80 2502 4444", distance: "3.8 km",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=200&fit=crop&auto=format",
    doctors: [
      { name: "Dr. Vijay Kumar", spec: "Pediatrics", exp: "18 yrs", fee: "₹500", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"], busy: ["11:00"] },
      { name: "Dr. Shalini Mehta", spec: "Dermatology", exp: "9 yrs", fee: "₹600", slots: ["09:30", "11:00", "14:30"], busy: [] },
    ],
  },
];

export function Appointment({ onBack, onNotify }: AppointmentProps) {
  const [step, setStep] = useState<"search" | "hospital" | "doctor" | "form" | "success">("search");
  const [query, setQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(hospitals[0].doctors[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", date: "", time: "" });
  const [countdown, setCountdown] = useState(3600);

  useEffect(() => {
    if (step === "success") {
      const int = setInterval(() => setCountdown((c) => c > 0 ? c - 1 : 0), 1000);
      return () => clearInterval(int);
    }
  }, [step]);

  const filtered = hospitals.filter(h => h.name.toLowerCase().includes(query.toLowerCase()) || h.location.toLowerCase().includes(query.toLowerCase()));

  function formatTime(s: number) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    onNotify({
      type: "appointment",
      title: "Appointment Confirmed!",
      message: `${form.name} — ${selectedDoctor.name} on ${form.date} at ${selectedSlot || form.time}`,
    });
    setStep("success");
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "linear-gradient(160deg, #eff6ff 0%, #f0fdf4 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step !== "success" && (
            <button onClick={step === "search" ? onBack : () => {
              if (step === "doctor") setStep("hospital");
              else if (step === "form") setStep("doctor");
              else setStep("search");
            }} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-5 transition-colors text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {/* Header */}
          <div className="rounded-3xl p-5 mb-5 text-white flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #1a6fd4, #1658b8)", boxShadow: "0 12px 30px rgba(26,111,212,0.3)" }}>
            <Calendar size={28} />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Book Appointment</h1>
              <p className="text-blue-200 text-sm">Find nearby hospitals & doctors</p>
            </div>
          </div>

          {/* Steps indicator */}
          {step !== "success" && (
            <div className="flex items-center gap-2 mb-6 px-2">
              {["Search", "Hospital", "Doctor", "Confirm"].map((s, i) => {
                const stepOrder = ["search", "hospital", "doctor", "form"];
                const active = stepOrder.indexOf(step) >= i;
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? "text-white" : "bg-slate-100 text-slate-400"}`}
                      style={active ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}>
                      {i + 1}
                    </div>
                    <span className={`text-xs hidden sm:inline ${active ? "text-blue-600 font-medium" : "text-slate-400"}`}>{s}</span>
                    {i < 3 && <div className="h-px flex-1 bg-slate-200" />}
                  </div>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* SEARCH */}
            {step === "search" && (
              <motion.div key="search" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none focus:border-blue-400 bg-white"
                    style={{ borderColor: "rgba(26,111,212,0.2)" }}
                    placeholder="Search hospitals, doctors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  {filtered.map((h, i) => (
                    <motion.button key={h.id} className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      onClick={() => { setSelectedHospital(h); setStep("hospital"); }}>
                      <img src={h.image} alt={h.name} className="w-full h-36 object-cover" />
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{h.name}</h3>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <MapPin size={12} /> {h.location}
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 mt-1" />
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium">{h.rating}</span>
                            <span className="text-xs text-slate-400">({h.reviews})</span>
                          </div>
                          <span className="text-xs text-slate-500">{h.distance}</span>
                          <span className="text-xs text-green-600 font-medium">{h.doctors.length} doctors</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* HOSPITAL DETAIL */}
            {step === "hospital" && (
              <motion.div key="hospital" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-4">
                  <img src={selectedHospital.image} alt={selectedHospital.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{selectedHospital.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1"><MapPin size={14} />{selectedHospital.location}</div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /><span className="font-medium">{selectedHospital.rating}</span></div>
                      <a href={`tel:${selectedHospital.phone}`} className="flex items-center gap-1 text-blue-600 text-sm"><Phone size={14} />{selectedHospital.phone}</a>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-3" style={{ fontFamily: "var(--font-display)" }}>Available Doctors</h3>
                <div className="space-y-3">
                  {selectedHospital.doctors.map((doc) => (
                    <motion.button key={doc.name} className="w-full text-left bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                      onClick={() => { setSelectedDoctor(doc); setStep("doctor"); }}
                      whileHover={{ scale: 1.01 }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
                        style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                        {doc.name.split(" ")[1][0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                        <p className="text-xs text-blue-500">{doc.spec} · {doc.exp} experience</p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">Fee: {doc.fee}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DOCTOR / SLOTS */}
            {step === "doctor" && (
              <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                      style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                      {selectedDoctor.name.split(" ")[1][0]}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">{selectedDoctor.name}</h2>
                      <p className="text-sm text-blue-500">{selectedDoctor.spec}</p>
                      <p className="text-xs text-slate-500">{selectedDoctor.exp} experience · Fee: {selectedDoctor.fee}</p>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 mb-3">Available Time Slots</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {selectedDoctor.slots.map((slot) => {
                    const busy = selectedDoctor.busy.includes(slot);
                    return (
                      <button key={slot} disabled={busy}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${busy ? "bg-slate-100 text-slate-300 cursor-not-allowed" : selectedSlot === slot ? "text-white" : "bg-white text-slate-700 border hover:border-blue-300"}`}
                        style={selectedSlot === slot && !busy ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}>
                        {busy ? `${slot} ✗` : slot}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => { if (selectedSlot) setStep("form"); }}
                  disabled={!selectedSlot}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                  Book Your Appointment
                </button>
              </motion.div>
            )}

            {/* FORM */}
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-800">{selectedHospital.name}</span> · {selectedDoctor.name}</p>
                  <p className="text-blue-600 font-medium mt-1">Selected Slot: {selectedSlot}</p>
                </div>

                <form onSubmit={handleBook} className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>Patient Details</h3>
                  {[
                    { key: "name", label: "Patient Name", type: "text", placeholder: "Full name" },
                    { key: "mobile", label: "Mobile Number", type: "tel", placeholder: "10-digit number" },
                    { key: "date", label: "Appointment Date", type: "date", placeholder: "" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400 bg-slate-50"
                        style={{ borderColor: "rgba(26,111,212,0.2)" }}
                        required />
                    </div>
                  ))}
                  <button type="submit"
                    className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                    Confirm Appointment
                  </button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl overflow-hidden shadow-xl">
                <div className="p-10 text-center text-white"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}>
                    <CheckCircle size={80} className="mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Appointment Confirmed!</h2>
                  <p className="text-green-100 text-sm">Your appointment has been successfully booked</p>
                </div>

                <div className="bg-white p-6 space-y-3">
                  {[
                    { label: "Patient", value: form.name || "Patient" },
                    { label: "Hospital", value: selectedHospital.name },
                    { label: "Doctor", value: selectedDoctor.name },
                    { label: "Specialization", value: selectedDoctor.spec },
                    { label: "Date", value: form.date || "Today" },
                    { label: "Time Slot", value: selectedSlot },
                    { label: "Fee", value: selectedDoctor.fee },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}

                  <div className="mt-4 p-4 rounded-2xl bg-blue-50 text-center">
                    <p className="text-xs text-slate-500 mb-1">Appointment starts in</p>
                    <p className="text-xl font-bold text-blue-600 tabular-nums">{formatTime(countdown)}</p>
                  </div>

                  <a href={`tel:${selectedHospital.phone}`}
                    className="block w-full py-3 rounded-xl text-white text-center font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                    Contact Hospital
                  </a>
                  <button onClick={onBack}
                    className="w-full py-3 rounded-xl text-slate-600 text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                    Return Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
