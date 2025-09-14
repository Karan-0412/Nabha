// Local mock store for appointments and calls with localStorage persistence

export type Role = 'patient' | 'doctor';

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
export type CallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string; // ISO
  type: 'video' | 'phone' | 'in-person';
  status: AppointmentStatus;
  durationMinutes?: number;
}

export interface Call {
  id: string;
  appointmentId?: string | null;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: CallStatus;
  startedAt?: string | null; // ISO
  endedAt?: string | null;   // ISO
}

interface DoctorAvailability {
  startHour: number; // 0-23
  endHour: number;   // 0-23
}

interface TelemedDB {
  appointments: Appointment[];
  calls: Call[];
  doctorAvailability: Record<string, DoctorAvailability>;
  reminderFlags: Record<string, { m60?: boolean; m30?: boolean; m15?: boolean }>;
  shiftReminder: { [doctorId: string]: string | undefined };
  seedVersion: number;
}

import { addNotification } from "@/store/notificationStore";

const STORAGE_KEY = 'telemed-db-v1';
const CURRENT_SEED_VERSION = 2;

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function readDB(): TelemedDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDB();
    const data = JSON.parse(raw) as TelemedDB;
    if (!data.seedVersion || data.seedVersion < CURRENT_SEED_VERSION) {
      return seedDB();
    }
    return data;
  } catch {
    return seedDB();
  }
}

function writeDB(db: TelemedDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  // Notify listeners (same tab)
  window.dispatchEvent(new CustomEvent('telemed:db-updated'));
}

function seedDB(): TelemedDB {
  const soon = new Date();
  soon.setHours(soon.getHours() + 2);
  const later = new Date();
  later.setDate(later.getDate() + 1);
  later.setHours(10, 0, 0, 0);

  const appointments: Appointment[] = [
    {
      id: uid('apt'),
      patientId: 'p1',
      patientName: 'Jane Smith',
      doctorId: 'd1',
      doctorName: 'Dr. Johnson',
      scheduledAt: soon.toISOString(),
      type: 'video',
      status: 'confirmed',
      durationMinutes: 30,
    },
    {
      id: uid('apt'),
      patientId: 'p2',
      patientName: 'John Doe',
      doctorId: 'd1',
      doctorName: 'Dr. Johnson',
      scheduledAt: later.toISOString(),
      type: 'video',
      status: 'pending',
      durationMinutes: 30,
    },
  ];

  const calls: Call[] = [];

  const doctorAvailability: Record<string, DoctorAvailability> = {
    d1: { startHour: 9, endHour: 17 },
    d2: { startHour: 10, endHour: 18 },
    d3: { startHour: 8, endHour: 16 },
  };

  const db: TelemedDB = {
    appointments,
    calls,
    doctorAvailability,
    reminderFlags: {},
    shiftReminder: {},
    seedVersion: CURRENT_SEED_VERSION,
  };
  writeDB(db);
  return db;
}

export function resetMockDB() {
  localStorage.removeItem(STORAGE_KEY);
  seedDB();
}

// Queries
export function getDBUnsafe() { return readDB(); }

export function getAppointments(): Appointment[] {
  return readDB().appointments
    .slice()
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function getAppointmentsForRole(role: Role): Appointment[] {
  const all = getAppointments();
  if (role === 'patient') return all.filter(a => a.patientId === 'p1');
  return all.filter(a => a.doctorId === 'd1');
}

export function getUpcomingAppointmentsForRole(role: Role): Appointment[] {
  const now = Date.now();
  return getAppointmentsForRole(role).filter(a => new Date(a.scheduledAt).getTime() >= now);
}

export function getCalls(): Call[] {
  return readDB().calls
    .slice()
    .sort((a, b) => {
      const tA = (a.startedAt || a.endedAt || '') as string;
      const tB = (b.startedAt || b.endedAt || '') as string;
      return tA.localeCompare(tB);
    });
}

export function getActiveOrRingingCallForPatient(patientId = 'p1'): Call | undefined {
  const calls = readDB().calls;
  return calls.find(c => c.patientId === patientId && (c.status === 'ringing' || c.status === 'active'));
}

export function getCallHistoryForRole(role: Role): Call[] {
  const calls = getCalls();
  if (role === 'patient') return calls.filter(c => c.patientId === 'p1' && c.status === 'ended');
  return calls.filter(c => c.doctorId === 'd1' && c.status === 'ended');
}

// Mutations
export function createAppointment(input: Omit<Appointment, 'id' | 'status' | 'type'> & { type?: Appointment['type']; status?: AppointmentStatus }): Appointment {
  const db = readDB();
  const apt: Appointment = {
    id: uid('apt'),
    type: input.type ?? 'video',
    status: input.status ?? 'confirmed',
    ...input,
  };
  db.appointments.push(apt);
  writeDB(db);
  addNotification({
    type: 'appointment',
    title: 'New appointment scheduled',
    message: `${apt.patientName} with ${apt.doctorName} at ${new Date(apt.scheduledAt).toLocaleString()}`,
    recipient: 'all',
  });
  return apt;
}

export function startCallNow(params: { patientId: string; patientName: string; doctorId: string; doctorName: string; appointmentId?: string | null }): Call {
  const db = readDB();
  const call: Call = {
    id: uid('call'),
    appointmentId: params.appointmentId ?? null,
    patientId: params.patientId,
    patientName: params.patientName,
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    status: 'active',
    startedAt: nowIso(),
    endedAt: null,
  };
  db.calls.push(call);
  writeDB(db);
  addNotification({
    type: 'call',
    title: 'Call started',
    message: `${call.patientName} with ${call.doctorName}`,
    recipient: 'all',
  });
  return call;
}

export function createRingingCall(params: { patientId: string; patientName: string; doctorId: string; doctorName: string; appointmentId?: string | null }): Call {
  const db = readDB();
  const call: Call = {
    id: uid('call'),
    appointmentId: params.appointmentId ?? null,
    patientId: params.patientId,
    patientName: params.patientName,
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    status: 'ringing',
    startedAt: null,
    endedAt: null,
  };
  db.calls.push(call);
  writeDB(db);
  addNotification({
    type: 'call',
    title: 'Incoming call',
    message: `${call.doctorName} is calling ${call.patientName}`,
    recipient: 'patient',
  });
  addNotification({
    type: 'call',
    title: 'Outbound call',
    message: `Calling ${call.patientName}`,
    recipient: 'doctor',
  });
  return call;
}

export function acceptCall(callId: string): Call | undefined {
  const db = readDB();
  const call = db.calls.find(c => c.id === callId);
  if (!call) return undefined;
  call.status = 'active';
  call.startedAt = nowIso();
  writeDB(db);
  addNotification({
    type: 'call',
    title: 'Call accepted',
    message: `${call.patientName} and ${call.doctorName} are now connected`,
    recipient: 'all',
  });
  return call;
}

export function declineCall(callId: string): Call | undefined {
  const db = readDB();
  const call = db.calls.find(c => c.id === callId);
  if (!call) return undefined;
  call.status = 'declined';
  call.endedAt = nowIso();
  writeDB(db);
  addNotification({
    type: 'call',
    title: 'Call declined',
    message: `${call.patientName} declined the call`,
    recipient: 'doctor',
  });
  return call;
}

export function endCall(callId: string): Call | undefined {
  const db = readDB();
  const call = db.calls.find(c => c.id === callId);
  if (!call) return undefined;
  call.status = 'ended';
  call.endedAt = nowIso();
  writeDB(db);
  addNotification({
    type: 'call',
    title: 'Call ended',
    message: `${call.patientName} with ${call.doctorName}`,
    recipient: 'all',
  });
  return call;
}

// Simple simulation helper
let simTimer: number | null = null;
export function startIncomingCallSimulation(patientId = 'p1') {
  stopIncomingCallSimulation();
  simTimer = window.setInterval(() => {
    const existing = getActiveOrRingingCallForPatient(patientId);
    if (existing) return;
    const shouldRing = Math.random() < 0.2; // 20% chance per tick
    if (shouldRing) {
      createRingingCall({ patientId, patientName: 'Jane Smith', doctorId: 'd1', doctorName: 'Dr. Johnson' });
    }
  }, 15000); // every 15s
}

export function stopIncomingCallSimulation() {
  if (simTimer) {
    window.clearInterval(simTimer);
    simTimer = null;
  }
}

// Listener utility for components
export function onDBUpdate(handler: () => void): () => void {
  const cb = () => handler();
  window.addEventListener('telemed:db-updated', cb as EventListener);
  window.addEventListener('storage', cb as EventListener);
  return () => {
    window.removeEventListener('telemed:db-updated', cb as EventListener);
    window.removeEventListener('storage', cb as EventListener);
  };
}
