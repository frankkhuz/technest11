"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#020044",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Main footer body */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-bold text-white mb-3 block"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                cursor: "pointer",
              }}
            >
              Tech<span style={{ color: "#EF3F23" }}>Nest</span>
            </button>
            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: "rgba(255,255,255,0.45)", maxWidth: 200 }}
            >
              Nigeria&apos;s trusted marketplace for buying, selling and
              swapping gadgets at fair market prices.
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#16a34a" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                🇳🇬 Nigerian Market
              </span>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Marketplace
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Browse Listings", href: "/marketplace" },
                { label: "Sell Your Device", href: "/value?type=sell" },
                { label: "Swap a Device", href: "/value?type=swap" },
                { label: "Value My Device", href: "/value" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => router.push(href)}
                    className="text-sm transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                    }
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Account
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Sign In", href: "/auth/login" },
                { label: "Register", href: "/auth/register" },
                { label: "My Dashboard", href: "/dashboard" },
                { label: "Seller Dashboard", href: "/seller/dashboard" },
                { label: "Vendor Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => router.push(href)}
                    className="text-sm transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                    }
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Contact
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://wa.me/2348186450477"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm flex items-center gap-2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#25d366")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  <span>💬</span> WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@technest.ng"
                  className="text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  hello@technest.ng
                </a>
              </li>
              <li>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Lagos, Nigeria
                </span>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/2348186450477"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 no-underline"
              style={{
                background: "#25d366",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        className="px-6 py-4"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {year} TechNest Nigeria. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Use"].map((t) => (
              <button
                key={t}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.25)", cursor: "pointer" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
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
