export type NotificationType = 'appointment' | 'message' | 'reminder' | 'call';
export type RecipientRole = 'patient' | 'doctor' | 'all';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO
  read: boolean;
  recipient: RecipientRole;
}

interface NotificationDB {
  notifications: NotificationItem[];
}

const STORAGE_KEY = 'telemed-notifications-v1';

function uid(prefix = 'ntf') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function readDB(): NotificationDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { notifications: [] };
    return JSON.parse(raw) as NotificationDB;
  } catch {
    return { notifications: [] };
  }
}

function writeDB(db: NotificationDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('telemed:notifications-updated'));
}

export function addNotification(input: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { read?: boolean }) {
  const db = readDB();
  const item: NotificationItem = {
    id: uid(),
    timestamp: new Date().toISOString(),
    read: input.read ?? false,
    ...input,
  };
  db.notifications.unshift(item);
  writeDB(db);
  return item;
}

export function markNotificationRead(id: string) {
  const db = readDB();
  const n = db.notifications.find(x => x.id === id);
  if (n) {
    n.read = true;
    writeDB(db);
  }
}

export function getNotifications(recipient: RecipientRole | 'any' = 'any') {
  const items = readDB().notifications;
  if (recipient === 'any') return items;
  return items.filter(n => n.recipient === recipient || n.recipient === 'all');
}

export function onNotificationsUpdate(handler: () => void) {
  const cb = () => handler();
  window.addEventListener('telemed:notifications-updated', cb as EventListener);
  window.addEventListener('storage', cb as EventListener);
  return () => {
    window.removeEventListener('telemed:notifications-updated', cb as EventListener);
    window.removeEventListener('storage', cb as EventListener);
  };
}
