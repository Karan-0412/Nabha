import { useEffect } from "react";
import { useUserContext } from "@/context/user-role";
import { addNotification } from "@/store/notificationStore";
import { getAppointmentsForRole, getDoctorAvailability, getReminderFlags, setReminderFlag, getAndSetShiftReminderIfNeeded } from "@/store/telemedStore";

function minutesUntil(dateIso: string) {
  const target = new Date(dateIso).getTime();
  const diffMs = target - Date.now();
  return Math.floor(diffMs / 60000);
}

export default function NotificationsAgent() {
  const { userRole } = useUserContext();

  useEffect(() => {
    if (!userRole) return;

    const handleTick = () => {
      const apts = getAppointmentsForRole(userRole);
      const flags = getReminderFlags();
      for (const apt of apts) {
        const m = minutesUntil(apt.scheduledAt);
        if (m <= 60 && m > 59 && !(flags[apt.id]?.m60)) {
          addNotification({ type: 'reminder', title: 'Appointment in 60 minutes', message: `${apt.patientName} • ${apt.doctorName} at ${new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, recipient: 'all' });
          setReminderFlag(apt.id, 'm60');
        }
        if (m <= 30 && m > 29 && !(flags[apt.id]?.m30)) {
          addNotification({ type: 'reminder', title: 'Appointment in 30 minutes', message: `${apt.patientName} • ${apt.doctorName}`, recipient: 'all' });
          setReminderFlag(apt.id, 'm30');
        }
        if (m <= 15 && m > 14 && !(flags[apt.id]?.m15)) {
          addNotification({ type: 'reminder', title: 'Appointment in 15 minutes', message: `${apt.patientName} • ${apt.doctorName}`, recipient: 'all' });
          setReminderFlag(apt.id, 'm15');
        }
      }

      if (userRole === 'doctor') {
        // Shift start reminder 15 minutes before start
        const doctorId = 'd1';
        const avail = getDoctorAvailability(doctorId);
        const now = new Date();
        const start = new Date(now);
        start.setHours(avail.startHour, 0, 0, 0);
        const diffM = Math.floor((start.getTime() - now.getTime()) / 60000);
        if (diffM <= 15 && diffM > 14) {
          const dateKey = `${now.toDateString()}_${avail.startHour}`;
          if (getAndSetShiftReminderIfNeeded(doctorId, dateKey)) {
            addNotification({ type: 'reminder', title: 'Shift starts in 15 minutes', message: `Your availability starts at ${avail.startHour}:00`, recipient: 'doctor' });
          }
        }
      }
    };

    const i = window.setInterval(handleTick, 30000);
    handleTick();
    return () => window.clearInterval(i);
  }, [userRole]);

  return null;
}
