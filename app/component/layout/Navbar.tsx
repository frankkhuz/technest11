"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Moon,
  ChevronDown,
  X,
  Menu,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Receipt,
  Building2,
  LogOut,
  BadgeCheck,
  ShieldCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { useCart } from "@/app/context/CartContext";
import { dashboardPath, isAdminUser, isSuperAdminUser, loginHref, type AuthUser } from "@/app/lib/auth";

const ACCENT = "#C2542D";
const SECONDARY = "#7C3AED";

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

function CartButton({
  size = "w-9 h-9",
  itemCount,
  onNavigate,
}: {
  size?: string;
  itemCount: number;
  onNavigate: () => void;
}) {
  return (
    <button
      onClick={onNavigate}
      aria-label="View cart"
      className={`relative ${size} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        cursor: "pointer",
      }}
    >
      <ShoppingCart size={15} />
      {itemCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: ACCENT, color: "#fff" }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

function RoleBadge({ user, size = "sm" }: { user: AuthUser; size?: "xs" | "sm" }) {
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  const icon = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";

  if (isAdminUser(user)) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold ${text}`} style={{ color: SECONDARY }}>
        <ShieldCheck className={icon} />
        {isSuperAdminUser(user) ? "Super Admin" : "Admin"}
      </span>
    );
  }

  if (user.userType === "vendor") {
    return user.vendorVerified ? (
      <span className={`inline-flex items-center gap-1 font-semibold ${text}`} style={{ color: ACCENT }}>
        Vendor
        <BadgeCheck className={icon} style={{ color: "#1d9bf0" }} aria-label="Verified vendor" />
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 font-medium ${text}`} style={{ color: "#d97706" }}>
        <Clock className={icon} />
        Vendor · Pending
      </span>
    );
  }

  return null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const { itemCount } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAvatarOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    const close = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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

  const isAdmin = isAdminUser(user);
  const isVendor = user?.userType === "vendor";

  const navLinks: { label: string; href: string; wide?: boolean }[] = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Value Device", href: "/value" },
    { label: "AI Recommender", href: "/recommend" },
    { label: "Fix My Device", href: "/fix" },
    { label: "How it Works", href: "/#how-it-works", wide: true },
    { label: "About Us", href: "/about", wide: true },
  ];

  const isActive = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  const accountLinks: { label: string; href: string; Icon: LucideIcon }[] = user
    ? [
        isAdmin
          ? { label: "Admin Panel", href: "/admin", Icon: ShieldCheck }
          : isVendor && !user.vendorVerified
            ? { label: "Complete Verification", href: "/become-vendor", Icon: BadgeCheck }
            : {
                label: "My Dashboard",
                href: dashboardPath(isVendor ? "vendor" : "user", user.vendorVerified),
                Icon: LayoutDashboard,
              },
        { label: "My Orders", href: "/orders", Icon: Package },
        { label: "My Transactions", href: "/transactions", Icon: Receipt },
        ...(user.userType === "vendor" ? [{ label: "B2B Hub", href: "/b2b", Icon: Building2 }] : []),
      ]
    : [];

  const go = (href: string) => {
    router.push(href);
    setMenuOpen(false);
    setAvatarOpen(false);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-colors duration-300"
        style={{
          background: "color-mix(in srgb, var(--surface) 90%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 h-14 sm:h-16">
          <button
            onClick={() => go("/")}
            className="flex items-center gap-2 text-lg sm:text-xl font-bold flex-shrink-0"
            style={{ fontFamily: "Space Grotesk, sans-serif", cursor: "pointer", color: "var(--ink)" }}
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${SECONDARY})`, color: "#fff" }}
            >
              TN
            </span>
            <span className="hidden min-[360px]:inline">
              Tech<span style={{ color: ACCENT }}>Nest</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center min-w-0">
            {navLinks.map(({ label, href, wide }) => {
              const active = isActive(href);
              return (
                <button
                  key={href}
                  onClick={() => go(href)}
                  aria-current={active ? "page" : undefined}
                  className={`relative text-sm px-3 py-2 rounded-lg whitespace-nowrap hover:bg-[var(--accent-soft)] ${wide ? "hidden xl:inline-flex" : "inline-flex"}`}
                  style={{
                    color: active ? "var(--ink)" : "var(--ink-soft)",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-[9px] h-[2px] rounded-full"
                      style={{ background: ACCENT }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle dark={dark} onToggle={toggle} size="w-9 h-9" />
            <CartButton itemCount={itemCount} onNavigate={() => go("/cart")} />

            {isLoading ? (
              <div className="hidden lg:block w-28 h-10 rounded-xl skeleton" />
            ) : user ? (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  aria-expanded={avatarOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl"
                  style={{ background: "var(--accent-soft)", cursor: "pointer" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {initials}
                  </div>
                  <div className="text-left max-w-[110px] leading-tight">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                      {user.name?.split(" ")[0]}
                    </p>
                    <RoleBadge user={user} size="xs" />
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5"
                    style={{
                      color: "var(--ink-soft)",
                      transform: avatarOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[52px] w-56 rounded-xl overflow-hidden shadow-xl origin-top-right"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
                          {user.email}
                        </p>
                        <div className="mt-1 empty:hidden">
                          <RoleBadge user={user} />
                        </div>
                      </div>
                      <div className="py-1">
                        {accountLinks.map(({ label, href, Icon }) => (
                          <button
                            key={label}
                            role="menuitem"
                            onClick={() => go(href)}
                            className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)]"
                            style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                      <button
                        role="menuitem"
                        onClick={() => {
                          signOut();
                          setAvatarOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm hover:bg-[rgba(220,38,38,0.08)]"
                        style={{ color: "#dc2626", borderTop: "1px solid var(--border)", cursor: "pointer" }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => go(loginHref(pathname))}
                  className="text-sm px-3 py-2 rounded-lg hover:bg-[var(--accent-soft)] whitespace-nowrap"
                  style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => go(pathname === "/" ? "/auth/register" : `/auth/register?from=${encodeURIComponent(pathname)}`)}
                  className="text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 whitespace-nowrap"
                  style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                >
                  Register
                </button>
              </div>
            )}

            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              style={{
                color: "var(--ink)",
                background: menuOpen ? "var(--accent-soft)" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={menuOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="panel"
              className="lg:hidden overflow-hidden"
              style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-1">
                  {navLinks.map(({ label, href }, i) => {
                    const active = isActive(href);
                    return (
                      <motion.button
                        key={href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i }}
                        onClick={() => go(href)}
                        aria-current={active ? "page" : undefined}
                        className="w-full text-left text-sm py-3 px-3 rounded-xl"
                        style={{
                          color: active ? ACCENT : "var(--ink)",
                          background: active ? "var(--accent-soft)" : "transparent",
                          fontWeight: active ? 600 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {label}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="my-3" style={{ height: 1, background: "var(--border)" }} />

                {user ? (
                  <>
                    <div
                      className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
                      style={{ background: "var(--accent-soft)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: ACCENT, color: "#fff" }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
                          {user.email}
                        </p>
                        <div className="mt-0.5 empty:hidden">
                          <RoleBadge user={user} />
                        </div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-1">
                      {accountLinks.map(({ label, href, Icon }) => (
                        <button
                          key={label}
                          onClick={() => go(href)}
                          className="w-full flex items-center gap-2.5 text-left text-sm py-3 px-3 rounded-xl"
                          style={{ color: "var(--ink-soft)", cursor: "pointer" }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 text-left text-sm py-3 px-3 rounded-xl font-medium"
                        style={{ color: "#dc2626", cursor: "pointer" }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 pb-1">
                    <button
                      onClick={() => go(loginHref(pathname))}
                      className="flex-1 text-sm py-3 rounded-xl border font-medium"
                      style={{ color: "var(--ink)", borderColor: "var(--border)", cursor: "pointer" }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => go(pathname === "/" ? "/auth/register" : `/auth/register?from=${encodeURIComponent(pathname)}`)}
                      className="flex-1 text-sm py-3 rounded-xl font-semibold hover:opacity-90"
                      style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: "rgba(10,6,14,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
