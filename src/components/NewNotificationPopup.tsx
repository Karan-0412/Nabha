import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getNotifications, onNotificationsUpdate, NotificationItem } from "@/store/notificationStore";
import { useUserContext } from "@/context/user-role";

const POPUP_DURATION = 4000; // ms

export default function NewNotificationPopup() {
  const { userRole } = useUserContext();
  const [current, setCurrent] = useState<NotificationItem | null>(null);
  const timerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, transform: 'translateY(6px)', pointerEvents: 'none' });

  useEffect(() => {
    if (!userRole) return;

    const seen = new Set<string>(getNotifications(userRole as any).map(n => n.id));

    const handle = () => {
      const items = getNotifications(userRole as any);
      const newest = items.find(i => !seen.has(i.id));
      if (newest) {
        seen.add(newest.id);
        showPopup(newest);
      }
    };

    const off = onNotificationsUpdate(handle);
    // initial prime
    handle();
    return () => off();
  }, [userRole]);

  const showPopup = (item: NotificationItem) => {
    setCurrent(item);
    positionNearButton();
    // show with animation
    requestAnimationFrame(() => {
      setVisible(true);
      setStyle({ opacity: 1, transform: 'translateY(0)', pointerEvents: 'auto' });
    });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => hidePopup(), POPUP_DURATION);
  };

  const hidePopup = () => {
    setStyle({ opacity: 0, transform: 'translateY(6px)', pointerEvents: 'none' });
    // wait for transition
    window.setTimeout(() => {
      setVisible(false);
      setCurrent(null);
    }, 250);
  };

  const positionNearButton = () => {
    const btn = document.querySelector('[data-notification-button]') as HTMLElement | null;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const popup = document.getElementById('new-notification-popup');
    if (!popup) return;
    const el = popup as HTMLElement;
    const top = rect.bottom + 8 + window.scrollY;
    const left = Math.max(8, rect.left + rect.width / 2 - 160 + window.scrollX);
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  };

  useEffect(() => {
    const handleResize = () => {
      if (visible) positionNearButton();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [visible]);

  if (!visible || !current) return null;

  return ReactDOM.createPortal(
    <div
      id="new-notification-popup"
      style={{
        position: 'absolute',
        zIndex: 9999,
        width: 320,
        transition: 'opacity 220ms ease, transform 220ms cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 6px 18px rgba(15,23,42,0.12)',
        borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(249,250,251,1))',
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#eef2ff,#eefcfb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#334155' }}>
        {/* simple icon based on type */}
        {current.type === 'message' ? '✉️' : current.type === 'reminder' ? '⏰' : '🔔'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{current.title}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: '#475569', lineHeight: '1.3' }}>{current.message}</div>
      </div>
      <button onClick={hidePopup} aria-label="Dismiss notification" style={{ marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
    </div>,
    document.body
  );
}
