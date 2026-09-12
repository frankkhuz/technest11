"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, ChevronDown, X, Menu } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { dashboardPath } from "@/app/lib/auth";

const ACCENT = "#7C3AED";

export function ThemeToggle({
  dark,
  onToggle,
  size = "w-9 h-9",
}: {
  dark: boolean;
  onToggle: () => void;
  size?: string;
}) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label="Toggle light and dark mode"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      className={`relative ${size} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        cursor: "pointer",
      }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          initial={{ rotate: -90, scale: 0.3, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
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
  const dashboardRole = user?.userType === "vendor" ? "vendor" : "user";

  const navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Value Device", href: "/value" },
  ];

  const linkStyle = { color: "var(--ink-soft)", cursor: "pointer" } as const;

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-colors duration-300"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Logo */}
          <button
            onClick={() => {
              router.push("/");
              setMenuOpen(false);
            }}
            className="text-xl font-bold flex-shrink-0"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            Tech<span style={{ color: ACCENT }}>Nest</span>
          </button>

          {/* Desktop links — center */}
          <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                style={linkStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--ink)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--ink-soft)")
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle dark={dark} onToggle={toggle} />
            {isLoading ? null : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors"
                  style={{ background: "var(--accent-soft)", cursor: "pointer" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {initials}
                  </div>
                  <div className="text-left">
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{ color: "var(--ink)" }}
                    >
                      {user.name?.split(" ")[0]}
                    </p>
                    <p
                      className="text-xs leading-tight font-medium"
                      style={{ color: ACCENT }}
                    >
                      {roleLabel}
                    </p>
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5 ml-1"
                    style={{
                      color: "var(--ink-soft)",
                      transform: avatarOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {avatarOpen && (
                  <div
                    className="absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--ink)" }}
                      >
                        {user.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
                        {roleLabel}
                        {user.userType === "vendor" && !user.isVerified && (
                          <span style={{ color: "#d97706" }}> · Pending</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        router.push(dashboardPath(dashboardRole));
                        setAvatarOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                      style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                    >
                      My Dashboard →
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setAvatarOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                      style={{
                        color: "#dc2626",
                        borderTop: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
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
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ink)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ink-soft)")
                  }
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile right — avatar pill or hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle dark={dark} onToggle={toggle} size="w-8 h-8" />
            {!isLoading && user && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "var(--accent-soft)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: ACCENT, color: "#fff" }}
                >
                  {initials}
                </div>
                <span className="text-xs font-medium" style={{ color: ACCENT }}>
                  {roleLabel}
                </span>
              </div>
            )}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{
                color: "var(--ink)",
                background: menuOpen ? "var(--accent-soft)" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu — full width slide-down */}
        {menuOpen && (
          <div
            className="sm:hidden"
            style={{
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
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
                  style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                >
                  {label}
                </button>
              ))}

              {/* Divider */}
              <div
                className="my-2"
                style={{ height: 1, background: "var(--border)" }}
              />

              {user ? (
                <>
                  {/* User info card */}
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: ACCENT, color: "#fff" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--ink)" }}
                      >
                        {user.name}
                      </p>
                      <p className="text-xs font-medium" style={{ color: ACCENT }}>
                        {roleLabel}
                        {user.userType === "vendor" && !user.isVerified && (
                          <span style={{ color: "#d97706" }}> · Pending</span>
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
                    style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                  >
                    My Dashboard →
                  </button>

                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left text-sm py-2.5 px-3 rounded-xl font-medium transition-colors"
                    style={{ color: "#dc2626", cursor: "pointer" }}
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
                      color: "var(--ink)",
                      borderColor: "var(--border)",
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
                    style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
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
