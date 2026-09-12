// Backed by app/context/ThemeContext.tsx — a single shared theme instance
// via React Context, so every page updates together on toggle instead of
// each holding an independent useState that only resyncs on refresh.
export { useTheme } from "@/app/context/ThemeContext";
