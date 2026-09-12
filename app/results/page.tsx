import { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center transition-colors duration-300"
          style={{ background: "var(--bg)" }}
        >
          <p className="text-lg" style={{ color: "var(--ink-soft)" }}>
            Loading results...
          </p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
