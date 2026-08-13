import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Providers from "./Providers";
import Navbar from "./component/layout/Navbar";
import Footer from "./component/layout/Footer";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
