export type Department = "general" | "cardiology" | "orthopedic" | "dental" | "neurology" | "pediatrics";

export interface Doctor {
  id: string;
  name: string;
  dept: Department;
  qualification: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  photo: string;
  bio: string;
  languages: string[];
  fee: number;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorDept: Department;
  date: string;
  slot: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

export const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

export const DEPT_COLORS: Record<Department, string> = {
  general: "#1a6fd4",
  cardiology: "#dc2626",
  orthopedic: "#7c3aed",
  dental: "#0891b2",
  neurology: "#d97706",
  pediatrics: "#16a34a",
};

export const DEPT_ICONS: Record<Department, string> = {
  general: "🩺",
  cardiology: "❤️",
  orthopedic: "🦴",
  dental: "🦷",
  neurology: "🧠",
  pediatrics: "👶",
};
