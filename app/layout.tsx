import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import Footer from "./component/layout/Footer";
import ChatWidget from "./component/layout/ChatWidget";
import BottomNav from "./component/layout/BottomNav";
import VendorVerificationReminder from "./component/layout/VendorVerificationReminder";
import ApiNotices from "./component/layout/ApiNotices";
import ServiceWorker from "./component/layout/ServiceWorker";

// Self-hosted at build time (no request to Google at runtime, no font
// swap jump). Exposed as CSS variables used throughout globals.css and the
// inline fontFamily styles.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TechNest — Nigerian Gadget Marketplace",
  description: "Buy, sell and swap gadgets at fair Nigerian market prices",
  appleWebApp: { capable: true, title: "TechNest", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Mobile keyboards shrink the visual viewport only — the layout (and the
  // fixed bottom nav) stays put instead of jumping up with the keyboard.
  interactiveWidget: "resizes-visual",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#18131a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Listing/product photos come from Cloudinary — open that connection early.
  // (no crossOrigin: plain <img> requests use a non-CORS connection)
  preconnect("https://res.cloudinary.com");

  return (
    // data-scroll-behavior lets Next turn off CSS smooth scrolling while it
    // resets scroll on route changes, so new pages open at the top instantly.
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
      {/* Column layout: <main> takes all spare height, so the footer always
          sits at the very bottom of the screen on short pages instead of
          floating mid-screen and jumping down once results load. */}
      <body className="flex flex-col min-h-[100dvh]">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <main className="flex-1 flex flex-col min-w-0">{children}</main>
              <Footer />
              <ChatWidget />
              <BottomNav />
              <VendorVerificationReminder />
              <ApiNotices />
              <ServiceWorker />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
