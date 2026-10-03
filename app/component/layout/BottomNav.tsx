"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Store, Plus, Wrench, User, type LucideIcon } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/context/CartContext";
import { dashboardPath } from "@/app/lib/auth";

type Item = {
  label: string;
  href: string;
  Icon: LucideIcon;
  match: (path: string) => boolean;
  primary?: boolean;
};

const HIDDEN_PREFIXES = ["/auth", "/checkout"];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const { user } = useAuth();
  const { itemCount } = useCart();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const accountHref = user
    ? dashboardPath(user.userType === "vendor" ? "vendor" : "user", user.vendorVerified)
    : "/auth/login";

  const items: Item[] = [
    { label: "Home", href: "/", Icon: Home, match: (p) => p === "/" },
    {
      label: "Shop",
      href: "/marketplace",
      Icon: Store,
      match: (p) => p.startsWith("/marketplace") || p.startsWith("/buy") || p.startsWith("/cart"),
    },
    { label: "Sell", href: "/value", Icon: Plus, match: (p) => p.startsWith("/value"), primary: true },
    { label: "Fix", href: "/fix", Icon: Wrench, match: (p) => p.startsWith("/fix") },
    {
      label: user ? "Account" : "Sign in",
      href: accountHref,
      Icon: User,
      match: (p) =>
        p.startsWith("/dashboard") ||
        p.startsWith("/user") ||
        p.startsWith("/orders") ||
        p.startsWith("/transactions"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40"
      style={{
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="grid grid-cols-5 h-[64px]">
        {items.map(({ label, href, Icon, match, primary }) => {
          const active = match(pathname);

          if (primary) {
            return (
              <li key={label} className="flex items-start justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-1 -mt-5"
                >
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, var(--accent), var(--secondary))",
                      color: "#fff",
                      boxShadow: "0 10px 24px -8px rgba(194,84,45,0.6)",
                      border: "3px solid var(--bg)",
                    }}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </motion.span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? "var(--accent)" : "var(--ink-soft)" }}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative h-full flex flex-col items-center justify-center gap-1"
                style={{ color: active ? "var(--accent)" : "var(--ink-soft)" }}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute top-0 h-[3px] w-8 rounded-b-full"
                    style={{ background: "var(--accent)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <motion.span whileTap={{ scale: 0.85 }} className="relative">
                  <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                  {label === "Shop" && itemCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </motion.span>
                <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
