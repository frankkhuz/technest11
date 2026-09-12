"use client";

import { useRouter } from "next/navigation";
import { MapPin, MessageCircle, Mail, ArrowUpRight } from "lucide-react";

const ACCENT = "#7C3AED";

const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse Listings", href: "/marketplace" },
      { label: "Sell Your Device", href: "/value?type=sell" },
      { label: "Swap a Device", href: "/value?type=swap" },
      { label: "Value My Device", href: "/value" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/auth/login" },
      { label: "Register", href: "/auth/register" },
      { label: "My Dashboard", href: "/user" },
      { label: "Vendor Dashboard", href: "/dashboard" },
    ],
  },
];

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0A0A0A" }}>
      <div style={{ height: 3, background: ACCENT }} />

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-white mb-3 block"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                cursor: "pointer",
              }}
            >
              Tech<span style={{ color: ACCENT }}>Nest</span>
            </button>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(255,255,255,0.5)", maxWidth: 320 }}
            >
              Nigeria&apos;s trusted marketplace for buying, selling and
              swapping gadgets at fair market prices — verified vendors,
              instant valuations, no scams.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#22c55e" }}
                />
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <MapPin className="w-3 h-3" /> Lagos, Nigeria
                </span>
              </div>
              <a
                href="mailto:hello@technest.ng"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors no-underline"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                }
              >
                <Mail className="w-3 h-3" /> hello@technest.ng
              </a>
            </div>
          </div>

          {columns.map(({ title, links }) => (
            <div key={title}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={`${title}-${href}`}>
                    <button
                      onClick={() => router.push(href)}
                      className="text-sm transition-colors"
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
                      }
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA strip */}
        <a
          href="https://wa.me/2348186450477"
          target="_blank"
          rel="noreferrer"
          className="mt-10 flex items-center justify-between gap-4 rounded-2xl px-5 py-4 no-underline transition-colors group"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(37,211,102,0.15)", color: "#25d366" }}
            >
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Need help? Chat with us on WhatsApp
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Usually replies within minutes
              </p>
            </div>
          </div>
          <ArrowUpRight
            className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: "rgba(255,255,255,0.4)" }}
          />
        </a>
      </div>

      {/* Bottom bar */}
      <div
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        className="px-6 py-5"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {year} TechNest Nigeria. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Use"].map((t) => (
              <button
                key={t}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
