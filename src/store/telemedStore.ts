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
export type { Appointment };

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

export interface DoctorAvailabilityWindow {
  startHour: number; // 0-23
  endHour: number;   // 0-23
}

interface TelemedDB {
  appointments: Appointment[];
  calls: Call[];
  doctorAvailability: Record<string, DoctorAvailabilityWindow[]>;
  reminderFlags: Record<string, { m60?: boolean; m30?: boolean; m15?: boolean }>;
  shiftReminder: { [doctorId: string]: string | undefined };
  seedVersion: number;
}

import { addNotification } from "@/store/notificationStore";

const STORAGE_KEY = 'telemed-db-v1';
const CURRENT_SEED_VERSION = 3;

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
    const data = JSON.parse(raw) as TelemedDB as any;
    // Migrations
    if (!('seedVersion' in data) || (data as any).seedVersion < CURRENT_SEED_VERSION) {
      return seedDB();
    }
    // Ensure availability is array
    if (data && data.doctorAvailability) {
      const fixed: Record<string, DoctorAvailabilityWindow[]> = {};
      for (const [k, v] of Object.entries<any>(data.doctorAvailability as any)) {
        if (Array.isArray(v)) fixed[k] = v as DoctorAvailabilityWindow[];
        else if (v && typeof v === 'object' && 'startHour' in v && 'endHour' in v) fixed[k] = [v as DoctorAvailabilityWindow];
        else fixed[k] = [{ startHour: 9, endHour: 17 }];
      }
      (data as any).doctorAvailability = fixed;
    }
    return data as TelemedDB;
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

  const doctorAvailability: Record<string, DoctorAvailabilityWindow[]> = {
    d1: [ { startHour: 9, endHour: 12 }, { startHour: 13, endHour: 17 } ],
    d2: [ { startHour: 10, endHour: 18 } ],
    d3: [ { startHour: 8, endHour: 16 } ],
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

export function acceptAppointment(appointmentId: string) {
  const db = readDB();
  const apt = db.appointments.find(a => a.id === appointmentId);
  if (!apt) return undefined;
  apt.status = 'confirmed';
  writeDB(db);
  // notify
  addNotification({
    type: 'appointment',
    title: 'Appointment accepted',
    message: `Your appointment with ${apt.doctorName} on ${new Date(apt.scheduledAt).toLocaleString()} has been accepted.`,
    recipient: 'patient',
  });
  // add chat message to patient
  import("@/store/messageStore").then(({ ensureRoom, addMessage }) => {
    const roomId = `patient-${apt.patientId}`;
    ensureRoom(roomId, apt.patientName, 'patient');
    addMessage(roomId, 'doctor', `Your appointment on ${new Date(apt.scheduledAt).toLocaleString()} has been accepted by ${apt.doctorName}.`);
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

// Availability
export function getDoctorAvailabilityWindows(doctorId: string): DoctorAvailabilityWindow[] {
  const db = readDB();
  return db.doctorAvailability[doctorId] ?? [{ startHour: 9, endHour: 17 }];
}

// Backward-compat helpers (first window)
export function getDoctorAvailability(doctorId: string) {
  const windows = getDoctorAvailabilityWindows(doctorId);
  return windows[0] ?? { startHour: 9, endHour: 17 };
}

export function setDoctorAvailabilityWindows(doctorId: string, windows: DoctorAvailabilityWindow[]) {
  const db = readDB();
  db.doctorAvailability[doctorId] = windows
    .map(w => ({ startHour: Math.max(0, Math.min(23, Math.floor(w.startHour))), endHour: Math.max(1, Math.min(24, Math.floor(w.endHour))) }))
    .filter(w => w.endHour > w.startHour);
  writeDB(db);
}

export function addDoctorAvailabilityWindow(doctorId: string, startHour: number, endHour: number) {
  const db = readDB();
  const arr = db.doctorAvailability[doctorId] ?? [];
  arr.push({ startHour, endHour });
  db.doctorAvailability[doctorId] = arr;
  writeDB(db);
}

export function updateDoctorAvailabilityWindow(doctorId: string, index: number, startHour: number, endHour: number) {
  const db = readDB();
  const arr = db.doctorAvailability[doctorId] ?? [];
  if (!arr[index]) return;
  arr[index] = { startHour, endHour };
  db.doctorAvailability[doctorId] = arr;
  writeDB(db);
}

export function removeDoctorAvailabilityWindow(doctorId: string, index: number) {
  const db = readDB();
  const arr = db.doctorAvailability[doctorId] ?? [];
  if (index < 0 || index >= arr.length) return;
  arr.splice(index, 1);
  db.doctorAvailability[doctorId] = arr.length ? arr : [{ startHour: 9, endHour: 17 }];
  writeDB(db);
}

// Legacy setter updates first window only
export function setDoctorAvailability(doctorId: string, startHour: number, endHour: number) {
  const db = readDB();
  const arr = db.doctorAvailability[doctorId] ?? [];
  if (arr.length === 0) db.doctorAvailability[doctorId] = [{ startHour, endHour }];
  else db.doctorAvailability[doctorId][0] = { startHour, endHour };
  writeDB(db);
}

export function isDoctorAvailableAt(doctorId: string, date: Date) {
  const windows = getDoctorAvailabilityWindows(doctorId);
  const h = date.getHours();
  return windows.some(w => h >= w.startHour && h < w.endHour);
}

export function getReminderFlags() {
  return readDB().reminderFlags;
}
export function setReminderFlag(aptId: string, key: 'm60'|'m30'|'m15') {
  const db = readDB();
  db.reminderFlags[aptId] = db.reminderFlags[aptId] || {};
  (db.reminderFlags[aptId] as any)[key] = true;
  writeDB(db);
}

export function getAndSetShiftReminderIfNeeded(doctorId: string, dateKey: string) {
  const db = readDB();
  const prev = db.shiftReminder[doctorId];
  if (prev === dateKey) return false;
  db.shiftReminder[doctorId] = dateKey;
  writeDB(db);
  return true;
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
