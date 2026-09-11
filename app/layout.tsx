import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./component/layout/Footer";
import ChatWidget from "./component/layout/ChatWidget";

export const metadata: Metadata = {
  title: "TechNest — Nigerian Gadget Marketplace",
  description: "Buy, sell and swap gadgets at fair Nigerian market prices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
