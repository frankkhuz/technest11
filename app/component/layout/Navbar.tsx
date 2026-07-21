"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { dashboardPath } from "@/app/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

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

  const roleLabel = user?.userType === "vendor" ? "Vendor" : "Buyer";

  const roleColor = user?.userType === "vendor" ? "#a78bfa" : "#4ade80";

  const dashboardRole = user?.userType === "vendor" ? "vendor" : "user";

  const navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Value Device", href: "/value" },
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "#020044",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Logo */}
          <button
            onClick={() => {
              router.push("/");
              setMenuOpen(false);
            }}
            className="text-xl font-bold text-white flex-shrink-0"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              cursor: "pointer",
            }}
          >
            Tech<span style={{ color: "#EF3F23" }}>Nest</span>
          </button>

          {/* Desktop links — center */}
          <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.65)", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {isLoading ? null : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.07)")
                  }
                >
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

                {avatarOpen && (
                  <div
                    className="absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      background: "#020044",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#fff" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: roleColor }}
                      >
                        {roleLabel}
                        {user.userType === "vendor" && !user.isVerified && (
                          <span style={{ color: "#fbbf24" }}> · Pending</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        router.push(dashboardPath(dashboardRole));
                        setAvatarOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                      }}
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
                    <button
                      onClick={() => {
                        signOut();
                        setAvatarOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                      style={{
                        color: "#EF3F23",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
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
              <>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-sm px-3 py-1.5 transition-colors"
                  style={{ color: "rgba(255,255,255,0.65)", cursor: "pointer" }}
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
                  style={{
                    background: "#EF3F23",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile right — avatar pill or hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            {!isLoading && user && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#EF3F23", color: "#fff" }}
                >
                  {initials}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: roleColor }}
                >
                  {roleLabel}
                </span>
              </div>
            )}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{
                color: "#fff",
                background: menuOpen ? "rgba(255,255,255,0.1)" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className="text-lg leading-none">
                {menuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu — full width slide-down */}
        {menuOpen && (
          <div
            className="sm:hidden"
            style={{
              background: "#020044",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {/* Nav links */}
              {navLinks.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => {
                    router.push(href);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-sm py-2.5 px-3 rounded-xl transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {label}
                </button>
              ))}

              {/* Divider */}
              <div
                className="my-2"
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.07)",
                }}
              />

              {user ? (
                <>
                  {/* User info card */}
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: "#EF3F23", color: "#fff" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#fff" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: roleColor }}
                      >
                        {roleLabel}
                        {user.userType === "vendor" && !user.isVerified && (
                          <span style={{ color: "#fbbf24" }}> · Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      router.push(dashboardPath(dashboardRole));
                      setMenuOpen(false);
                    }}
                    className="w-full text-left text-sm py-2.5 px-3 rounded-xl transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
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

                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left text-sm py-2.5 px-3 rounded-xl font-medium transition-colors"
                    style={{ color: "#EF3F23", cursor: "pointer" }}
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
                </>
              ) : (
                <div className="flex gap-2 pt-1 pb-1">
                  <button
                    onClick={() => {
                      router.push("/auth/login");
                      setMenuOpen(false);
                    }}
                    className="flex-1 text-sm py-2.5 rounded-xl border font-medium transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      borderColor: "rgba(255,255,255,0.2)",
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      router.push("/auth/register");
                      setMenuOpen(false);
                    }}
                    className="flex-1 text-sm py-2.5 rounded-xl font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "#EF3F23",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
