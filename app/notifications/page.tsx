"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import NotificationList, { markNotificationRead } from "@/app/component/shared/NotificationList";
import type { AppNotification } from "@/app/lib/notifications";
import { PageShell, Button } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?from=/notifications");
      return;
    }
    apiJson<{ notifications: AppNotification[] }>("/api/notifications")
      .then((r) => setItems(r.data?.notifications ?? []))
      .finally(() => setLoading(false));
  }, [isLoading, user, router]);

  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    await markNotificationRead("all");
    setItems((n) => n.map((x) => ({ ...x, read: true })));
  };

  return (
    <PageShell
      title="Notifications"
      Icon={Bell}
      subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
      actions={
        unread > 0 ? (
          <Button variant="soft" Icon={CheckCheck} onClick={markAll}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <RowListSkeleton count={5} />
      ) : (
        <NotificationList
          notifications={items}
          onRead={(id) => setItems((n) => n.map((x) => (x._id === id ? { ...x, read: true } : x)))}
        />
      )}
    </PageShell>
  );
}
