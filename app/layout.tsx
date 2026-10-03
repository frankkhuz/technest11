import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import Footer from "./component/layout/Footer";
import ChatWidget from "./component/layout/ChatWidget";
import BottomNav from "./component/layout/BottomNav";
import VendorVerificationReminder from "./component/layout/VendorVerificationReminder";

export const metadata: Metadata = {
  title: "TechNest — Nigerian Gadget Marketplace",
  description: "Buy, sell and swap gadgets at fair Nigerian market prices",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="has-bottom-nav">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Footer />
              <ChatWidget />
              <BottomNav />
              <VendorVerificationReminder />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
