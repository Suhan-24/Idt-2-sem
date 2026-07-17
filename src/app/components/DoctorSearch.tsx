import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, Star, Volume2, ChevronRight, Filter, Loader2 } from "lucide-react";
import { doctors as staticDoctors } from "../data/doctors";
import { DEPT_COLORS, DEPT_ICONS, type Department, type Doctor } from "../data/types";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";
import { fetchDoctors } from "../api";

interface DoctorSearchProps {
  onBack: () => void;
  onSelectDoctor: (doctorId: string) => void;
  lang: Lang;
  darkMode: boolean;
  initialQuery?: string;
}

const departments: { id: Department; labelKey: string }[] = [
  { id: "general", labelKey: "deptGeneral" },
  { id: "cardiology", labelKey: "deptCardiology" },
  { id: "orthopedic", labelKey: "deptOrthopedic" },
  { id: "dental", labelKey: "deptDental" },
  { id: "neurology", labelKey: "deptNeurology" },
  { id: "pediatrics", labelKey: "deptPediatrics" },
];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  window.speechSynthesis.speak(utter);
}

export function DoctorSearch({ onBack, onSelectDoctor, lang, darkMode, initialQuery = "" }: DoctorSearchProps) {
  const [selectedDept, setSelectedDept] = useState<Department | "all">("all");
  const [query, setQuery] = useState(initialQuery);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "fee" | "experience">("rating");
  const [allDoctors, setAllDoctors] = useState<Doctor[]>(staticDoctors);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  // Fetch from backend on mount; fall back to static list on error
  useEffect(() => {
    fetchDoctors()
      .then((data) => {
        setAllDoctors(data as unknown as Doctor[]);
        setApiOnline(true);
      })
      .catch(() => {
        // Keep static doctors as fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return allDoctors
      .filter((d) => {
        const matchDept = selectedDept === "all" || d.dept === selectedDept;
        const q = query.toLowerCase();
        const matchQ = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.dept.includes(q);
        return matchDept && matchQ;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "fee") return a.fee - b.fee;
        return b.experience - a.experience;
      });
  }, [allDoctors, selectedDept, query, sortBy]);

  const card = darkMode ? "rgba(30,41,59,0.9)" : "white";
  const cardBorder = darkMode ? "rgba(99,179,237,0.1)" : "rgba(26,111,212,0.1)";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: darkMode ? "#0f172a" : "linear-gradient(160deg, #eff6ff 0%, #f0fdf4 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={onBack} className={`flex items-center gap-2 mb-5 text-sm transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"}`}>
            <ArrowLeft size={16} /> {t(lang, "back")}
          </button>

          {/* API status indicator */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            {loading ? (
              <span className="flex items-center gap-1.5 text-blue-400"><Loader2 size={12} className="animate-spin" /> Loading doctors…</span>
            ) : (
              <span className={`flex items-center gap-1.5 ${apiOnline ? "text-green-500" : "text-amber-500"}`}>
                <span className={`w-2 h-2 rounded-full ${apiOnline ? "bg-green-400" : "bg-amber-400"}`} />
                {apiOnline ? "Live data" : "Offline mode"}
              </span>
            )}
          </div>

          <div className="rounded-3xl p-5 mb-6 text-white flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)", boxShadow: "0 12px 30px rgba(26,111,212,0.3)" }}>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{t(lang, "chooseDept")}</h1>
              <p className="text-blue-100 text-sm mt-0.5">{t(lang, "chooseDeptDesc")}</p>
            </div>
            <button onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors">
              <Filter size={15} /> Filter
            </button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden">
                <div className="p-4 rounded-2xl flex flex-wrap items-center gap-3"
                  style={{ background: card, border: `1px solid ${cardBorder}` }}>
                  <span className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Sort by:</span>
                  {(["rating", "fee", "experience"] as const).map((s) => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${sortBy === s ? "text-white" : darkMode ? "text-slate-300 bg-white/10" : "text-slate-600 bg-slate-100"}`}
                      style={sortBy === s ? { background: "#1a6fd4" } : {}}>
                      {s === "rating" ? "⭐ Rating" : s === "fee" ? "₹ Fee (Low)" : "🎓 Experience"}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-none transition-colors focus:border-blue-400 ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-800"}`}
              placeholder={t(lang, "searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Department chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedDept === "all" ? "text-white" : darkMode ? "text-slate-300 bg-slate-800 border border-slate-700" : "bg-white text-slate-600 border border-slate-200"}`}
              style={selectedDept === "all" ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}>
              🏥 All Departments
            </button>
            {departments.map((dept) => (
              <button key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${selectedDept === dept.id ? "text-white border-transparent" : darkMode ? "text-slate-300 bg-slate-800 border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}
                style={selectedDept === dept.id ? { background: DEPT_COLORS[dept.id] } : {}}>
                {DEPT_ICONS[dept.id]} {t(lang, dept.labelKey)}
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className={`text-xs font-medium mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* Doctor cards */}
          <div className="space-y-4">
            {filtered.map((doc, i) => (
              <motion.div key={doc.id}
                className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ background: card, border: `1px solid ${cardBorder}` }}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img src={doc.photo} alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                        }} />
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold hidden`}
                        style={{ background: DEPT_COLORS[doc.dept] }}>
                        {doc.name.split(" ")[1][0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{doc.name}</h3>
                          <p className="text-sm" style={{ color: DEPT_COLORS[doc.dept] }}>{doc.specialization}</p>
                          <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{doc.qualification}</p>
                        </div>
                        <button
                          onClick={() => speak(`${doc.name}. ${doc.specialization}. ${doc.experience} years experience. Consultation fee: ${doc.fee} rupees.`)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}
                          aria-label="Read aloud">
                          <Volume2 size={15} className="text-blue-400" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{doc.rating}</span>
                          <span className="text-xs text-slate-400">({doc.reviews})</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
                          style={{ background: `${DEPT_COLORS[doc.dept]}18`, color: DEPT_COLORS[doc.dept] }}>
                          {DEPT_ICONS[doc.dept]} {t(lang, `dept${doc.dept.charAt(0).toUpperCase() + doc.dept.slice(1)}`)}
                        </span>
                        <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {t(lang, "experience")}: {doc.experience} yrs
                        </span>
                        <span className="text-xs text-green-600 font-semibold">₹{doc.fee}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.languages.map((l) => (
                          <span key={l} className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bio (truncated) */}
                  <p className={`text-xs mt-3 leading-relaxed line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{doc.bio}</p>

                  {/* Book button */}
                  <motion.button
                    onClick={() => onSelectDoctor(doc.id)}
                    className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${DEPT_COLORS[doc.dept]}, ${DEPT_COLORS[doc.dept]}bb)` }}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    {t(lang, "bookSlot")} <ChevronRight size={15} />
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl mb-3 block">🔍</span>
                <p className={`font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>No doctors found. Try a different search.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
