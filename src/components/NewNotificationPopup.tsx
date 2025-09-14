import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { getNotifications, onNotificationsUpdate, NotificationItem } from "@/store/notificationStore";
import { useUserContext } from "@/context/user-role";

export default function NewNotificationPopup() {
  const { userRole } = useUserContext();
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userRole) return;

    const prime = () => {
      const current = getNotifications(userRole as any);
      seenIdsRef.current = new Set(current.map(n => n.id));
    };

    const handle = () => {
      if (!userRole) return;
      const items = getNotifications(userRole as any);
      for (const n of items) {
        if (!seenIdsRef.current.has(n.id)) {
          toast({ title: n.title, description: n.message });
          seenIdsRef.current.add(n.id);
        }
      }
    };

    prime();
    const unsub = onNotificationsUpdate(handle);
    return () => unsub();
  }, [userRole]);

  return null;
}
