"use client";
import ThemeProvider from "./context/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
