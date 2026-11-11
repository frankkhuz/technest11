"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Zap, ShoppingCart, User, type LucideIcon } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/context/CartContext";
import { dashboardPath, isAdminUser, loginHref } from "@/app/lib/auth";

type Item = {
  label: string;
  href: string;
  Icon: LucideIcon;
  active: boolean;
  primary?: boolean;
  badge?: number;
};

// /admin is its own full-screen console with its own header and tabs.
const HIDDEN_PREFIXES = ["/auth", "/checkout", "/admin"];

/** Height of the bar itself, excluding the iPhone home-indicator inset. */
const BAR_H = 64;

const ACCOUNT_PREFIXES = [
  "/dashboard",
  "/admin",
  "/user",
  "/orders",
  "/transactions",
  "/account",
  "/requests",
  "/disputes",
  "/reviews",
  "/notifications",
  "/b2b",
  "/become-vendor",
];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const { user } = useAuth();
  const { itemCount } = useCart();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const accountHref = !user
    ? loginHref(pathname)
    : isAdminUser(user)
      ? "/admin"
      : dashboardPath(user.userType === "vendor" ? "vendor" : "user", user.vendorVerified);


  const items: Item[] = [
    { label: "Home", href: "/", Icon: Home, active: pathname === "/" },
    {
      label: "Categories",
      href: "/buy?condition=uk-used",
      Icon: LayoutGrid,
      active: pathname.startsWith("/buy") || pathname.startsWith("/marketplace"),
    },
    { label: "Flash Sales", href: "/flash-sales", Icon: Zap, active: pathname.startsWith("/flash-sales"), primary: true },
    { label: "Cart", href: "/cart", Icon: ShoppingCart, active: pathname.startsWith("/cart"), badge: itemCount },
    {
      label: user ? "Account" : "Sign in",
      href: accountHref,
      Icon: User,
      active: ACCOUNT_PREFIXES.some((p) => pathname.startsWith(p)),
    },
  ];

  return (
    <>
      {/* Reserves the bar's space at the end of the page so the footer and
          last row of content are never hidden behind it. */}
      <div
        aria-hidden
        className="sm:hidden"
        style={{ height: `calc(${BAR_H}px + env(safe-area-inset-bottom))` }}
      />
      <nav
        aria-label="Primary"
        className="vt-bottom-nav sm:hidden fixed bottom-0 inset-x-0 z-40"
        style={{
          background: "color-mix(in srgb, var(--surface) 88%, transparent)",
          backdropFilter: "saturate(180%) blur(18px)",
          WebkitBackdropFilter: "saturate(180%) blur(18px)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -8px 30px -12px rgba(26,21,32,0.25)",
          paddingBottom: "env(safe-area-inset-bottom)",
          // Own compositing layer: the bar never repaints/jitters while the
          // page underneath scrolls or re-renders.
          transform: "translateZ(0)",
        }}
      >
        <ul className="grid grid-cols-5" style={{ height: BAR_H }}>
          {items.map(({ label, href, Icon, active, primary, badge }) => {
            if (primary) {
              return (
                <li key={label} className="flex items-start justify-center">
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className="flex flex-col items-center gap-0.5 -mt-4 min-w-[64px]"
                  >
                    <motion.span
                      whileTap={{ scale: 0.9 }}
                      className="sheen rounded-2xl flex items-center justify-center"
                      style={{
                        width: 54,
                        height: 54,
                        background:
                          "linear-gradient(145deg, #ff8a4c 0%, var(--accent) 45%, var(--secondary) 100%)",
                        color: "#fff",
                        boxShadow: active
                          ? "0 12px 26px -8px rgba(194,84,45,0.75), inset 0 1px 0 rgba(255,255,255,0.45)"
                          : "0 10px 22px -10px rgba(194,84,45,0.6), inset 0 1px 0 rgba(255,255,255,0.45)",
                        border: "3px solid var(--bg)",
                      }}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2.4} fill="#fff" />
                    </motion.span>
                    <span
                      className="text-[10px] font-bold leading-none whitespace-nowrap"
                      style={{ color: active ? "var(--accent)" : "var(--ink)" }}
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
                      style={{
                        background: "linear-gradient(90deg, var(--accent), var(--secondary))",
                        boxShadow: "0 2px 10px rgba(194,84,45,0.55)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className="relative flex items-center justify-center w-11 h-7 rounded-full"
                    style={{ background: active ? "var(--accent-soft)" : "transparent" }}
                  >
                    <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                    {!!badge && badge > 0 && (
                      <span
                        className="num absolute -top-1 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: "var(--accent)",
                          color: "#fff",
                          border: "2px solid var(--surface)",
                        }}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </motion.span>
                  <span className={`text-[10px] leading-none whitespace-nowrap ${active ? "font-bold" : "font-medium"}`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

