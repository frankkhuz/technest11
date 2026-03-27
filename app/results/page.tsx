import { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <p className="text-[#7070a0] text-lg">Loading results...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
