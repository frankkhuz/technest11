"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { dashboardPath } from "@/app/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const roleLabel =
    user?.role === "seller"
      ? "Seller"
      : user?.role === "vendor"
      ? "Vendor"
      : "Buyer";

  const roleColor =
    user?.role === "seller"
      ? "#EF3F23"
      : user?.role === "vendor"
      ? "#774499"
      : "#4ade80";

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
          {isLoading ? null : user ? (
            /* ── Logged-in state ── */
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.07)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
                }
              >
                {/* Avatar circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "#EF3F23", color: "#fff" }}
                >
                  {initials}
                </div>
                <div className="text-left">
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: "#fff" }}
                  >
                    {user.name?.split(" ")[0]}
                  </p>
                  <p
                    className="text-xs leading-tight font-medium"
                    style={{ color: roleColor }}
                  >
                    {roleLabel}
                  </p>
                </div>
                <span
                  className="text-xs ml-1"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    transform: avatarOpen ? "rotate(180deg)" : "none",
                    display: "inline-block",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </span>
              </button>

              {/* Dropdown */}
              {avatarOpen && (
                <div
                  className="absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-lg border"
                  style={{
                    background: "#020044",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {/* User info header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#fff" }}
                    >
                      {user.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: roleColor }}>
                      {roleLabel}
                      {user.vendorStatus === "pending" && (
                        <span style={{ color: "#fbbf24" }}> · Pending</span>
                      )}
                    </p>
                  </div>

                  {/* Dashboard link */}
                  <button
                    onClick={() => {
                      router.push(dashboardPath(user.role));
                      setAvatarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    → My Dashboard
                  </button>

                  {/* Sign out */}
                  <button
                    onClick={() => {
                      signOut();
                      setAvatarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs border-t transition-colors"
                    style={{
                      color: "#EF3F23",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(239,63,35,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged-out state ── */
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

            {user ? (
              <>
                {/* Mobile user info */}
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "#EF3F23", color: "#fff" }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#fff" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: roleColor }}
                    >
                      {roleLabel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    router.push(dashboardPath(user.role));
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  → My Dashboard
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg font-medium"
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
    </>
  );
}
