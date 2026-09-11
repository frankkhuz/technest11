"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route sat under /dashboard, which middleware.ts restricts to
// vendor accounts — but this page's content is the buyer dashboard, so
// vendor-only gating was blocking the exact users it was meant for.
// The real buyer dashboard now lives at /user; redirect here for any
// bookmarked/old links.
export default function DashboardUserRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user");
  }, [router]);

  return null;
}
