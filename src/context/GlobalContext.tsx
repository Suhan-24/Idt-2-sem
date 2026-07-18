import React, { createContext, useContext, useState, useEffect } from "react";
import type { Notification, UserProfile } from "../components/Header";
import type { Lang } from "../i18n/translations";
import type { Appointment } from "../data/types";
import { fetchAppointments } from "../services/api";

interface GlobalState {
  user: UserProfile | null;
  notifications: Notification[];
  appointments: Appointment[];
  lang: Lang;
  darkMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  userLocation: string | null;
  
  // Mutators
  setUser: (user: UserProfile | null) => void;
  setLang: (lang: Lang) => void;
  setDarkMode: (darkMode: boolean) => void;
  setHighContrast: (hc: boolean) => void;
  setLargeText: (lt: boolean) => void;
  setUserLocation: (loc: string | null) => void;
  
  addNotification: (n: { type: string; title: string; message: string }) => void;
  markRead: (id: string) => void;
  handleBooked: (appt: Appointment) => void;
  handleCancelAppointment: (id: string) => void;
  handleRescheduleAppointment: (id: string, newDate: string, newSlot: string) => void;
  bookedSlots: { doctorId: string; date: string; slot: string }[];
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "alert", title: "Welcome to MedCare!", message: "Your health platform is ready. Book appointments, consult doctors, and more.", time: "Now", read: false },
    { id: "2", type: "reminder", title: "Medicine Reminder", message: "Metformin 500mg – Time for your morning dose", time: "8:00 AM", read: false },
    { id: "3", type: "appointment", title: "Upcoming Appointment", message: "Dr. Ramesh Iyer – Cardiology – Tomorrow 10:00 AM", time: "Yesterday", read: true },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments()
      .then((data) => setAppointments(data as Appointment[]))
      .catch((err) => console.error("Failed to fetch appointments:", err));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.classList.toggle("high-contrast", highContrast);
    if (largeText) {
      root.style.fontSize = "18px";
    } else {
      root.style.fontSize = "";
    }
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

  const bookedSlots = appointments
    .filter((a) => a.status === "upcoming")
    .map((a) => ({ doctorId: a.doctorId, date: a.date, slot: a.slot }));

  const value = {
    user, setUser,
    notifications,
    appointments,
    lang, setLang,
    darkMode, setDarkMode,
    highContrast, setHighContrast,
    largeText, setLargeText,
    userLocation, setUserLocation,
    addNotification,
    markRead,
    handleBooked,
    handleCancelAppointment,
    handleRescheduleAppointment,
    bookedSlots
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (ctx === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return ctx;
}
