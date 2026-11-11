/// <reference types="react/canary" />
import { ViewTransition } from "react";

/**
 * Each route change animates like a native app: the old screen fades out
 * and the new one slides in (see the ::view-transition rules in
 * globals.css). The top bar and bottom bar have their own transition names,
 * so they stay perfectly still. Browsers without View Transitions fall back
 * to the plain .page-enter fade.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="page-screen">
      <div className="page-enter flex-1 min-w-0">{children}</div>
    </ViewTransition>
  );
}
