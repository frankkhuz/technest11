"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { dashboardPath } from "@/app/lib/auth";
import { Menu, X, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const roleLabel =
    user?.role === "seller"
      ? "Seller"
      : user?.role === "vendor"
      ? "Vendor"
      : "Buyer";
  const navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Value Device", href: "/value" },
  ];

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <button
          onClick={() => {
            router.push("/");
            setMenuOpen(false);
          }}
          className="mono-label font-bold flex-shrink-0"
          style={{ color: "var(--ink)", cursor: "pointer" }}
        >
          TECH<span style={{ color: "var(--accent)" }}>NEST</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="mono-label px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--ink-soft)", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--ink-soft)")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
          {isLoading ? null : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors"
                style={{ border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "var(--accent)", color: "#fff" }}
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
                    className="mono-label leading-tight"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--ink-soft)",
                    transform: avatarOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {avatarOpen && (
                <div
                  className="absolute right-0 top-14 w-48 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={() => {
                      router.push(dashboardPath(user.role));
                      setAvatarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                  >
                    → Dashboard
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setAvatarOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{
                      color: "var(--accent)",
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
                className="text-sm px-3 py-1.5"
                style={{ color: "var(--ink-soft)", cursor: "pointer" }}
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="mono-label px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Register
              </button>
            </>
          )}
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{
              color: "var(--ink)",
              background: menuOpen ? "var(--surface)" : "transparent",
              cursor: "pointer",
            }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="sm:hidden px-4 py-3 space-y-1"
          style={{
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {navLinks.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => {
                router.push(href);
                setMenuOpen(false);
              }}
              className="w-full text-left text-sm py-2.5 px-3 rounded-xl"
              style={{ color: "var(--ink-soft)", cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
