import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

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
      <body style={{ background: "#000000" }}>
        <AuthProvider>{children}</AuthProvider>{" "}
      </body>
    </html>
  );
}
