"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  interface User {
    role: string;
    name: string;
  }

  const role = (session?.user as User)?.role;
  const name = (session?.user as User)?.name || "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });

  useEffect(() => {
    fetch("/api/notifications?unread=true")
      .then((r) => r.json())
      .then((d) => setNotifCount(d.count || 0))
      .catch(() => {});
  }, [session]);

  const handleSignOut = async () => {
    setDropOpen(false);
    setSnack({ open: true, msg: "Signing out...", severity: "info" });
    setTimeout(() => signOut({ callbackUrl: "/" }), 800);
  };

  const avatarColors: Record<string, string> = {
    vendor: "#774499",
    user: "#EF3F23",
  };
  const avatarBg = avatarColors[role] || "#020044";

  return (
    <>
      <nav
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{
          background: "#020044",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white flex-shrink-0"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Value Device", href: "/value" },
          ].map(({ label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          {session ? (
            <>
              {/* Notification bell */}
              <button
                onClick={() =>
                  router.push(
                    role === "vendor" ? "/vendor/dashboard" : "/dashboard"
                  )
                }
                className="relative p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                🔔
                {notifCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "#EF3F23", fontSize: "9px" }}
                  >
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: avatarBg }}
                  >
                    {initials || "?"}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {name.split(" ")[0]}
                    </p>
                    <p
                      className="text-xs leading-tight capitalize"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {role}
                    </p>
                  </div>
                  <span className="text-white/40 text-xs">▾</span>
                </button>

                {dropOpen && (
                  <div
                    className="absolute right-0 top-11 w-52 rounded-xl shadow-xl overflow-hidden z-50 border"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(2,0,68,0.1)",
                    }}
                  >
                    {/* User info header */}
                    <div
                      className="px-4 py-3 border-b"
                      style={{
                        borderColor: "rgba(2,0,68,0.08)",
                        background: "rgba(2,0,68,0.03)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: avatarBg }}
                        >
                          {initials || "?"}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold leading-tight"
                            style={{ color: "#020044" }}
                          >
                            {name}
                          </p>
                          <p
                            className="text-xs capitalize leading-tight"
                            style={{ color: "#6B6B8A" }}
                          >
                            {role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      {
                        label: "Dashboard",
                        href:
                          role === "vendor"
                            ? "/vendor/dashboard"
                            : "/dashboard",
                        icon: "🏠",
                      },
                      {
                        label: "Marketplace",
                        href: "/marketplace",
                        icon: "🛒",
                      },
                      { label: "Value Device", href: "/value", icon: "📱" },
                    ].map(({ label, href, icon }) => (
                      <button
                        key={href}
                        onClick={() => {
                          router.push(href);
                          setDropOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                        style={{ color: "#020044" }}
                      >
                        <span>{icon}</span> {label}
                      </button>
                    ))}

                    <div style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-red-50"
                        style={{ color: "#EF3F23" }}
                      >
                        <span>🚪</span> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm px-3 py-1.5 transition-colors"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                }
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: "#EF3F23", color: "#fff" }}
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-white text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="absolute top-full left-0 right-0 p-4 space-y-2 sm:hidden z-50"
            style={{
              background: "#020044",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {session && (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: avatarBg }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p
                    className="text-xs capitalize"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {role}
                  </p>
                </div>
              </div>
            )}
            {[
              { label: "Marketplace", href: "/marketplace" },
              { label: "Value Device", href: "/value" },
            ].map(({ label, href }) => (
              <button
                key={href}
                onClick={() => {
                  router.push(href);
                  setMenuOpen(false);
                }}
                className="w-full text-left text-sm py-2 px-3 rounded-lg"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {label}
              </button>
            ))}
            {session ? (
              <>
                <button
                  onClick={() => {
                    router.push(
                      role === "vendor" ? "/vendor/dashboard" : "/dashboard"
                    );
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Dashboard {notifCount > 0 && `(${notifCount})`}
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg"
                  style={{ color: "#EF3F23" }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/register");
                    setMenuOpen(false);
                  }}
                  className="w-full text-sm font-semibold py-2 px-3 rounded-lg"
                  style={{ background: "#EF3F23", color: "#fff" }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Close dropdown on outside click */}
      {dropOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropOpen(false)}
        />
      )}
    </>
  );
}
