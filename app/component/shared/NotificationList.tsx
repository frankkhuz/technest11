"use client";

import { useRouter } from "next/navigation";
import { Bell, Megaphone, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { isAdminUser } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import {
  NOTIFICATION_ICONS,
  ALERT_NOTIFICATION_TYPES,
  notificationHref,
  type AppNotification,
} from "@/app/lib/notifications";
import { timeAgo } from "@/app/component/ui/kit";

export async function markNotificationRead(id: string) {
  await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) }).catch(() => {});
}

export default function NotificationList({
  notifications,
  onRead,
  compact,
}: {
  notifications: AppNotification[];
  onRead?: (id: string) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const viewer = user ? { userType: user.userType, isAdmin: isAdminUser(user) } : null;

  if (notifications.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center border"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--ink-soft)" }} />
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          No notifications yet
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {notifications.map((n) => {
        const isAlert = ALERT_NOTIFICATION_TYPES.has(n.type);
        const NotifIcon = NOTIFICATION_ICONS[n.type] ?? Megaphone;
        const href = notificationHref(n, viewer);
        const open = () => {
          if (!n.read) {
            markNotificationRead(n._id);
            onRead?.(n._id);
          }
          if (href) router.push(href);
        };
        return (
          <div
            key={n._id}
            onClick={open}
            className="rounded-xl p-4 border flex gap-3"
            style={{
              border: "1px solid var(--border)",
              background: n.read ? "var(--surface)" : "var(--accent-soft)",
              cursor: href ? "pointer" : "default",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isAlert ? "rgba(220,38,38,0.1)" : "var(--accent-soft)",
                color: isAlert ? "#DC2626" : "var(--accent)",
              }}
            >
              <NotifIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-0.5" style={{ color: "var(--ink)" }}>
                {n.title}
              </p>
              <p className="text-xs whitespace-pre-line" style={{ color: "var(--ink-soft)" }}>
                {n.message}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                {timeAgo(n.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between flex-shrink-0">
              {!n.read ? (
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "#DC2626" }} />
              ) : (
                <span />
              )}
              {href && <ChevronRight className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
