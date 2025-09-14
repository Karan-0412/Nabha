export interface MessageRecord {
  id: string;
  roomId: string; // e.g. patient-p1 or doctor-d1
  sender: 'patient' | 'doctor' | 'system' | 'assistant' | 'user';
  text: string;
  timestamp: string; // ISO
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'patient' | 'doctor' | 'ai' | 'system';
}

const STORAGE_KEY = 'telemed-messages-v1';

function uid(prefix = 'msg') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function readDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rooms: [] as ChatRoom[], messages: [] as MessageRecord[] };
    return JSON.parse(raw) as { rooms: ChatRoom[]; messages: MessageRecord[] };
  } catch {
    return { rooms: [] as ChatRoom[], messages: [] as MessageRecord[] };
  }
}

function writeDB(db: { rooms: ChatRoom[]; messages: MessageRecord[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('telemed:messages-updated'));
}

export function addMessage(roomId: string, sender: MessageRecord['sender'], text: string) {
  const db = readDB();
  const msg: MessageRecord = { id: uid('m'), roomId, sender, text, timestamp: new Date().toISOString() };
  db.messages.push(msg);
  writeDB(db);
  return msg;
}

export function getMessagesForRoom(roomId: string) {
  const db = readDB();
  return db.messages.filter(m => m.roomId === roomId).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
}

export function ensureRoom(roomId: string, name: string, type: ChatRoom['type'] = 'patient') {
  const db = readDB();
  const existing = db.rooms.find(r => r.id === roomId);
  if (existing) return existing;
  const room: ChatRoom = { id: roomId, name, type };
  db.rooms.push(room);
  writeDB(db);
  return room;
}

export function getRooms() {
  return readDB().rooms.slice();
}

export function onMessagesUpdate(handler: () => void) {
  const cb = () => handler();
  window.addEventListener('telemed:messages-updated', cb as EventListener);
  window.addEventListener('storage', cb as EventListener);
  return () => {
    window.removeEventListener('telemed:messages-updated', cb as EventListener);
    window.removeEventListener('storage', cb as EventListener);
  };
}
