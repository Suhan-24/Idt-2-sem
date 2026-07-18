import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic, Volume2, Stethoscope, AlertTriangle, ChevronRight, Loader } from "lucide-react";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";

import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

interface SymptomCheckerProps {
  onClose: () => void;
}

const symptomResponses: Record<string, { severity: "low" | "medium" | "high"; conditions: string[]; advice: string; dept: string }> = {
  headache: { severity: "low", conditions: ["Tension Headache", "Migraine", "Dehydration"], advice: "Rest in a quiet room, stay hydrated, and take OTC pain relievers. See a doctor if pain is severe or persistent.", dept: "neurology" },
  chest: { severity: "high", conditions: ["Angina", "Heart Attack", "Muscle Strain", "Anxiety"], advice: "URGENT: Chest pain may indicate a serious cardiac event. Call emergency services immediately or visit the ER.", dept: "cardiology" },
  fever: { severity: "medium", conditions: ["Viral Infection", "Bacterial Infection", "COVID-19", "Dengue"], advice: "Stay hydrated, rest, and monitor temperature. Seek medical attention if fever exceeds 102°F or persists beyond 3 days.", dept: "general" },
  cough: { severity: "low", conditions: ["Common Cold", "Flu", "Allergic Rhinitis", "Bronchitis"], advice: "Rest, drink warm fluids, and use honey-lemon. See a doctor if cough persists beyond 2 weeks or blood is present.", dept: "general" },
  back: { severity: "medium", conditions: ["Muscle Strain", "Disc Herniation", "Spondylitis", "Kidney Issues"], advice: "Apply ice/heat pack, avoid heavy lifting. Consult an orthopedic specialist if pain is severe or radiates to legs.", dept: "orthopedic" },
  joint: { severity: "medium", conditions: ["Arthritis", "Gout", "Bursitis", "Sports Injury"], advice: "Rest the affected joint, apply ice, and take anti-inflammatory medicine. See an orthopedic specialist.", dept: "orthopedic" },
  stomach: { severity: "medium", conditions: ["Gastritis", "IBS", "Food Poisoning", "Appendicitis"], advice: "Avoid heavy food, stay hydrated. See a doctor immediately if pain is severe, especially in lower right abdomen.", dept: "general" },
  tooth: { severity: "low", conditions: ["Dental Caries", "Gum Disease", "Abscess", "Sensitivity"], advice: "Rinse with warm salt water. Avoid very hot or cold foods. Consult a dentist promptly as dental infections can spread.", dept: "dental" },
  child: { severity: "medium", conditions: ["Common Cold", "Ear Infection", "Fever", "Allergies"], advice: "Monitor your child's temperature and fluid intake. Consult a pediatrician for children under 3 with any symptoms.", dept: "pediatrics" },
};

const commonSymptoms = ["Headache", "Chest Pain", "Fever", "Cough", "Back Pain", "Joint Pain", "Stomach Pain", "Tooth Pain", "Child Symptoms"];

function analyzeSymptoms(text: string) {
  const lower = text.toLowerCase();
  for (const [key, response] of Object.entries(symptomResponses)) {
    if (lower.includes(key) || (key === "back" && lower.includes("back pain")) || (key === "joint" && lower.includes("joint")) || (key === "stomach" && (lower.includes("stomach") || lower.includes("abdomen") || lower.includes("abdominal"))) || (key === "chest" && lower.includes("chest")) || (key === "child" && (lower.includes("child") || lower.includes("baby") || lower.includes("infant")))) {
      return response;
    }
  }
  return {
    severity: "low" as const,
    conditions: ["Unspecified Condition"],
    advice: "Your symptoms are noted. For an accurate diagnosis, please consult a General Physician. We recommend booking an appointment for a proper evaluation.",
    dept: "general",
  };
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  window.speechSynthesis.speak(u);
}

export function SymptomChecker({ onClose }: SymptomCheckerProps) {
  const { lang, darkMode } = useGlobal();
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeSymptoms> | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!symptom.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(analyzeSymptoms(symptom));
      setLoading(false);
    }, 1800);
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    setListening(true);
    recognition.onresult = (event: any) => {
      setSymptom(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  const severityColors = { low: "#16a34a", medium: "#d97706", high: "#dc2626" };
  const severityLabels = { low: "Low Risk", medium: "Moderate — See a Doctor", high: "⚠️ URGENT — Seek Help Now" };

  const bg = darkMode ? "#1e293b" : "white";
  const text = darkMode ? "text-white" : "text-slate-800";
  const subtext = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: bg, maxHeight: "90vh" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25 }}>
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)", borderBottom: "none" }}>
            <div className="flex items-center gap-2 text-white">
              <Stethoscope size={22} />
              <div>
                <h3 className="font-bold">{t(lang, "symptomTitle")}</h3>
                <p className="text-blue-100 text-xs">{t(lang, "symptomDesc")}</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
            <div className="p-5">
              {/* Quick symptoms */}
              {!result && (
                <div className="mb-4">
                  <p className={`text-xs font-semibold mb-2 ${subtext}`}>Quick Select:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((s) => (
                      <button key={s} onClick={() => setSymptom(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              {!result && (
                <form onSubmit={handleAnalyze} className="space-y-3">
                  <div className="relative">
                    <textarea
                      className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none focus:border-blue-400 resize-none ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200"}`}
                      rows={3}
                      placeholder={t(lang, "symptomPlaceholder")}
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                    />
                    <button type="button" onClick={handleVoice}
                      className={`absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${listening ? "bg-red-500" : darkMode ? "hover:bg-slate-600" : "hover:bg-blue-100"}`}
                      aria-label="Voice input">
                      <Mic size={15} className={listening ? "text-white" : "text-slate-400"} />
                    </button>
                  </div>
                  <button type="submit" disabled={!symptom.trim() || loading}
                    className="w-full py-3 rounded-2xl text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #1a6fd4, #7c3aed)" }}>
                    {loading ? <><Loader size={16} className="animate-spin" /> Analyzing...</> : t(lang, "analyze")}
                  </button>
                </form>
              )}

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Severity badge */}
                    <div className="p-4 rounded-2xl text-white"
                      style={{ background: severityColors[result.severity] }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.severity === "high" && <AlertTriangle size={18} />}
                          <span className="font-bold">{severityLabels[result.severity]}</span>
                        </div>
                        <button onClick={() => speak(result.advice)} aria-label="Read aloud">
                          <Volume2 size={16} className="opacity-70 hover:opacity-100" />
                        </button>
                      </div>
                    </div>

                    {/* Possible conditions */}
                    <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${subtext}`}>Possible Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {result.conditions.map((c) => (
                          <span key={c} className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: `${severityColors[result.severity]}18`, color: severityColors[result.severity] }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Advice */}
                    <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-blue-50"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${subtext}`}>AI Recommendation</p>
                      <p className={`text-sm leading-relaxed ${text}`}>{result.advice}</p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => { navigate(`/doctors?dept=${result.dept}`); onClose(); }}
                        className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-1.5"
                        style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                        Book a Doctor <ChevronRight size={15} />
                      </button>
                      <button onClick={() => { setResult(null); setSymptom(""); }}
                        className={`px-5 py-3 rounded-2xl text-sm font-semibold border transition-colors ${darkMode ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
