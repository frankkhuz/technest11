"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  interface User {
    role: string;
  }

  const role = (session?.user as User)?.role;
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications?unread=true")
      .then((r) => r.json())
      .then((d) => setNotifCount(d.count || 0))
      .catch(() => {});
  }, [session]);

  return (
    <nav
      className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{
        background: "#020044",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={() => router.push("/")}
        className="text-xl font-bold text-white"
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
      >
        Tech<span style={{ color: "#EF3F23" }}>Nest</span>
      </button>

      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={() => router.push("/marketplace")}
          className="text-sm px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.65)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
          }
        >
          Marketplace
        </button>
        <button
          onClick={() => router.push("/value")}
          className="text-sm px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.65)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
          }
        >
          Value Device
        </button>

        {session ? (
          <>
            <button
              onClick={() =>
                router.push(
                  role === "vendor" ? "/vendor/dashboard" : "/dashboard"
                )
              }
              className="relative text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
            >
              Dashboard
              {notifCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  style={{ background: "#EF3F23", fontSize: "9px" }}
                >
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
              }
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm px-3 py-1.5 rounded-lg transition-colors"
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
              className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "#EF3F23", color: "#fff" }}
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <button
        className="sm:hidden text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 p-4 space-y-2 sm:hidden"
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
                Dashboard
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left text-sm py-2 px-3 rounded-lg"
                style={{ color: "rgba(255,255,255,0.4)" }}
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
  );
}
