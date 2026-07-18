/**
 * api.ts – Typed fetch helpers for all MedCare REST endpoints.
 * The Vite dev server proxies /api/* → http://localhost:3001
 */

export const API_BASE = '/api';

// ─── Response Shape ───────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as T;
}

// ─── Types (mirrors backend output) ─────────────────────────────────────────

export interface ApiDoctor {
  id: string;
  name: string;
  dept: string;
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

export interface ApiAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorDept: string;
  date: string;
  slot: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ApiMedicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  prescription_required: boolean;
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export async function fetchDoctors(params?: { dept?: string; q?: string; available?: boolean }): Promise<ApiDoctor[]> {
  const qs = new URLSearchParams();
  if (params?.dept) qs.set('dept', params.dept);
  if (params?.q) qs.set('q', params.q);
  if (params?.available) qs.set('available', '1');
  return request<ApiDoctor[]>(`/doctors${qs.toString() ? '?' + qs.toString() : ''}`);
}

export async function fetchDoctorById(id: string): Promise<ApiDoctor> {
  return request<ApiDoctor>(`/doctors/${id}`);
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function fetchAppointments(params?: { phone?: string; status?: string }): Promise<ApiAppointment[]> {
  const qs = new URLSearchParams();
  if (params?.phone) qs.set('phone', params.phone);
  if (params?.status) qs.set('status', params.status);
  return request<ApiAppointment[]>(`/appointments${qs.toString() ? '?' + qs.toString() : ''}`);
}

export async function createAppointment(data: {
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorDept: string;
  date: string;
  slot: string;
  reason?: string;
}): Promise<ApiAppointment> {
  return request<ApiAppointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function patchAppointment(id: string, data: { status?: string; date?: string; slot?: string }): Promise<ApiAppointment> {
  return request<ApiAppointment>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function cancelAppointment(id: string): Promise<void> {
  await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
}

// ─── Medicines ────────────────────────────────────────────────────────────────

export async function fetchMedicines(params?: { category?: string; q?: string }): Promise<ApiMedicine[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.q) qs.set('q', params.q);
  return request<ApiMedicine[]>(`/medicines${qs.toString() ? '?' + qs.toString() : ''}`);
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function placeMedicineOrder(data: {
  name: string;
  phone: string;
  address: string;
  pin: string;
  items: any[];
  total: number;
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to place order');
  return res.json();
}

// ─── Video Consultations ───────────────────────────────────────────────────────

export async function bookVideoConsultation(data: {
  doctor_name: string;
  department: string;
  date: string;
  slot: string;
  upi_id: string;
}) {
  const res = await fetch(`${API_BASE}/video-consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to book video consultation');
  return res.json();
}

// ─── Emergencies ───────────────────────────────────────────────────────────────

export async function requestEmergencyAmbulance(data: {
  location: string;
  driver_id?: string;
  driver_name?: string;
}) {
  const res = await fetch(`${API_BASE}/emergencies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to dispatch ambulance');
  return res.json();
}

