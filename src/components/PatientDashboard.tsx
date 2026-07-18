import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, TrendingUp, Calendar, FileText, Upload, Bell, User, Activity, Trash2, Eye, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getDoctorById } from "../data/doctors";
import { DEPT_COLORS, DEPT_ICONS, type Appointment, type MedicalRecord } from "../data/types";
import type { Lang } from "../i18n/translations";
import { t } from "../i18n/translations";
import type { Notification } from "./Header";

import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";
import { fetchRecords, uploadRecord, deleteRecordApi, type ApiMedicalRecord } from "../services/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function PatientDashboard() {
  const { lang, darkMode, user, appointments, notifications, markRead: onMarkRead } = useGlobal();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"overview" | "records" | "profile" | "notifications">("overview");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);


  
  useEffect(() => {
    if (user?.mobile) {
      fetchRecords(user.mobile)
        .then((data) => setRecords(data as MedicalRecord[]))
        .catch((err) => console.error("Failed to load records:", err));
    }
  }, [user?.mobile]);

  const total = appointments.length;
  const upcoming = appointments.filter((a) => a.status === "upcoming").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const unread = notifications.filter((n) => !n.read).length;

  // Monthly bar chart data
  const monthlyData = MONTHS.map((month, idx) => ({
    month,
    count: appointments.filter((a) => new Date(a.date).getMonth() === idx).length,
  }));

  // Dept pie chart data
  const deptMap: Record<string, number> = {};
  appointments.forEach((a) => { deptMap[a.doctorDept] = (deptMap[a.doctorDept] || 0) + 1; });
  const pieData = Object.entries(deptMap).map(([dept, count]) => ({
    name: dept.charAt(0).toUpperCase() + dept.slice(1),
    value: count,
    color: DEPT_COLORS[dept as keyof typeof DEPT_COLORS] || "#1a6fd4",
  }));

  const card = darkMode ? "rgba(30,41,59,0.9)" : "white";
  const border = darkMode ? "rgba(99,179,237,0.1)" : "rgba(26,111,212,0.1)";
  const text = darkMode ? "text-white" : "text-slate-800";
  const subtext = darkMode ? "text-slate-400" : "text-slate-500";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const newRecord = await uploadRecord({
        patientPhone: user.mobile,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: file.type.includes("image") ? "Imaging" : "Document",
        date: new Date().toISOString().split("T")[0],
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      });
      setRecords([newRecord as MedicalRecord, ...records]);
    } catch (err) {
      console.error("Failed to upload record:", err);
      alert("Failed to upload record");
    } finally {
      e.target.value = "";
    }
  }

  const statsCards = [
    { label: t(lang, "totalAppts"), value: total, icon: Calendar, color: "#1a6fd4", bg: "rgba(26,111,212,0.1)" },
    { label: t(lang, "upcomingAppts"), value: upcoming, icon: TrendingUp, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: t(lang, "completedAppts"), value: completed, icon: Activity, color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    { label: t(lang, "cancelledAppts"), value: cancelled, icon: X, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  ];

  const navItems = [
    { id: "overview", icon: TrendingUp, label: "Overview" },
    { id: "records", icon: FileText, label: t(lang, "medRecords") },
    { id: "notifications", icon: Bell, label: t(lang, "notifications") },
    { id: "profile", icon: User, label: "Profile" },
  ] as const;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: darkMode ? "#0f172a" : "linear-gradient(160deg, #eff6ff 0%, #f0fff8 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 mb-6 text-sm transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"}`}>
            <ArrowLeft size={16} /> {t(lang, "back")}
          </button>

          {/* Dashboard header */}
          <div className="rounded-3xl p-5 mb-5 text-white"
            style={{ background: "linear-gradient(135deg, #0d2d6e, #1a6fd4)", boxShadow: "0 12px 30px rgba(13,45,110,0.3)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{t(lang, "dashTitle")}</h1>
                <p className="text-blue-200 text-sm mt-0.5">Welcome back, {user?.name || "Patient"} 👋</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                {user?.name?.[0]?.toUpperCase() || "P"}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[200px_1fr] gap-5">
            {/* Sidebar nav */}
            <div className="rounded-2xl p-3 h-fit space-y-1 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
              {navItems.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === id ? "text-white" : darkMode ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}
                  style={activeSection === id ? { background: "linear-gradient(135deg, #1a6fd4, #16a34a)" } : {}}>
                  <Icon size={16} /> {label}
                  {id === "notifications" && unread > 0 && (
                    <span className="ml-auto text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">{unread}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Main content */}
            <AnimatePresence mode="wait">
              {activeSection === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {statsCards.map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="rounded-2xl p-4 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                          <Icon size={18} style={{ color }} />
                        </div>
                        <p className={`text-2xl font-extrabold ${text}`} style={{ fontFamily: "var(--font-display)", color }}>{value}</p>
                        <p className={`text-xs mt-0.5 ${subtext}`}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Bar chart */}
                    <div className="rounded-2xl p-5 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                      <h3 className={`font-bold mb-4 text-sm ${text}`}>Monthly Appointments</h3>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "#f0f0f0"} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: darkMode ? "#64748b" : "#94a3b8" }} />
                          <YAxis tick={{ fontSize: 10, fill: darkMode ? "#64748b" : "#94a3b8" }} />
                          <Tooltip contentStyle={{ background: darkMode ? "#1e293b" : "white", border: "none", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
                          <Bar dataKey="count" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                          <defs>
                            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1a6fd4" />
                              <stop offset="100%" stopColor="#16a34a" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie chart */}
                    <div className="rounded-2xl p-5 shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                      <h3 className={`font-bold mb-4 text-sm ${text}`}>By Department</h3>
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                              {pieData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend iconSize={10} iconType="circle" formatter={(value) => <span style={{ fontSize: 11, color: darkMode ? "#94a3b8" : "#64748b" }}>{value}</span>} />
                            <Tooltip contentStyle={{ background: darkMode ? "#1e293b" : "white", border: "none", borderRadius: 12, fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className={`h-40 flex items-center justify-center text-sm ${subtext}`}>No appointment data yet</div>
                      )}
                    </div>
                  </div>

                  {/* Recent appointments */}
                  <div className="rounded-2xl shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#f0f9ff" }}>
                      <h3 className={`font-bold text-sm ${text}`}>Recent Appointments</h3>
                      <button onClick={() => navigate("/myappointments")} className="text-xs text-blue-500 hover:underline">{t(lang, "viewAll")}</button>
                    </div>
                    {appointments.slice(0, 4).map((appt, i) => (
                      <div key={appt.id} className={`flex items-center gap-3 p-4 border-b last:border-0 ${darkMode ? "border-white/5" : "border-slate-50"}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                          style={{ background: `${DEPT_COLORS[appt.doctorDept]}18` }}>
                          {DEPT_ICONS[appt.doctorDept as keyof typeof DEPT_ICONS]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${text}`}>{appt.doctorName}</p>
                          <p className={`text-xs ${subtext}`}>{appt.date} · {appt.slot}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${appt.status === "upcoming" ? "bg-blue-100 text-blue-600" : appt.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {t(lang, appt.status)}
                        </span>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className={`p-8 text-center text-sm ${subtext}`}>No appointments yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === "records" && (
                <motion.div key="records" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="rounded-2xl shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#f0f9ff" }}>
                      <h3 className={`font-bold ${text}`}>{t(lang, "medRecords")}</h3>
                      <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium"
                        style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                        <Upload size={14} /> {t(lang, "uploadRecord")}
                      </button>
                      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.png,.jpeg,.doc,.docx" onChange={handleUpload} />
                    </div>
                    <div className="divide-y" style={{ borderColor: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff" }}>
                      {records.map((rec) => (
                        <div key={rec.id} className="flex items-center gap-3 p-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(26,111,212,0.1)" }}>
                            <FileText size={18} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${text}`}>{rec.name}</p>
                            <p className={`text-xs ${subtext}`}>{rec.type} · {rec.date} · {rec.size}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setViewRecord(rec)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-blue-50"}`}>
                              <Eye size={15} className="text-blue-400" />
                            </button>
                            <button onClick={() => setDeleteRecord(rec.id)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-red-50"}`}>
                              <Trash2 size={15} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {records.length === 0 && (
                        <div className={`p-12 text-center text-sm ${subtext}`}>
                          <FileText size={36} className="mx-auto mb-3 opacity-30" />
                          No medical records yet. Upload your first record.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "notifications" && (
                <motion.div key="notifs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="rounded-2xl shadow-sm" style={{ background: card, border: `1px solid ${border}` }}>
                    <div className="p-4 border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#f0f9ff" }}>
                      <h3 className={`font-bold ${text}`}>{t(lang, "notifications")} {unread > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unread} new</span>}</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff" }}>
                      {notifications.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${!n.read ? darkMode ? "bg-white/5" : "bg-blue-50/30" : ""} ${darkMode ? "hover:bg-white/10" : "hover:bg-slate-50"}`}
                          onClick={() => onMarkRead(n.id)}>
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${text}`}>{n.title}</p>
                            <div className="flex gap-2 mt-4">
                              <button onClick={() => navigate(`/doctors`)} className="text-xs text-blue-500 font-semibold hover:underline">Rebook</button>
                            </div>
                            <p className={`text-xs mt-0.5 ${subtext}`}>{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className={`p-12 text-center text-sm ${subtext}`}>No notifications yet</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="rounded-2xl shadow-sm p-6" style={{ background: card, border: `1px solid ${border}` }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                        style={{ background: "linear-gradient(135deg, #1a6fd4, #16a34a)" }}>
                        {user?.name?.[0]?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${text}`}>{user?.name || "Patient"}</h2>
                        <p className={`text-sm ${subtext}`}>MedCare Member</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Mobile", value: user?.mobile || "—" },
                        { label: "Age", value: user?.age || "—" },
                        { label: "Location", value: user?.place || "—" },
                        { label: "Total Appointments", value: String(total) },
                        { label: "Upcoming Appointments", value: String(upcoming) },
                      ].map(({ label, value }) => (
                        <div key={label} className={`flex items-center justify-between py-3 border-b ${darkMode ? "border-white/10" : "border-slate-50"} last:border-0`}>
                          <span className={`text-sm ${subtext}`}>{label}</span>
                          <span className={`text-sm font-semibold ${text}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* View record modal */}
      <AnimatePresence>
        {viewRecord && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewRecord(null)} />
            <motion.div className="relative w-full max-w-sm rounded-3xl p-6"
              style={{ background: darkMode ? "#1e293b" : "white" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <button onClick={() => setViewRecord(null)} className="absolute top-4 right-4"><X size={18} className="text-slate-400" /></button>
              <FileText size={40} className="text-blue-500 mb-3" />
              <h3 className={`font-bold ${text}`}>{viewRecord.name}</h3>
              <p className={`text-sm ${subtext} mt-1`}>{viewRecord.type} · {viewRecord.date}</p>
              <div className="mt-4 p-4 rounded-xl text-center" style={{ background: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff" }}>
                <p className={`text-sm ${subtext}`}>Preview not available in demo mode.</p>
                <p className="text-xs text-blue-400 mt-1">File: {viewRecord.size}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete record confirm */}
      <AnimatePresence>
        {deleteRecord && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRecord(null)} />
            <motion.div className="relative w-full max-w-xs rounded-3xl p-6 text-center"
              style={{ background: darkMode ? "#1e293b" : "white" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
              <h3 className={`font-bold ${text}`}>Delete Record?</h3>
              <p className={`text-sm ${subtext} mt-1`}>This action cannot be undone.</p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteRecord(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                  Keep
                </button>
                <button onClick={async () => { 
                    if (!deleteRecord) return;
                    try {
                      await deleteRecordApi(deleteRecord);
                      setRecords((r) => r.filter((rec) => rec.id !== deleteRecord)); 
                      setDeleteRecord(null); 
                    } catch (err) {
                      console.error("Failed to delete record:", err);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-red-500">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
