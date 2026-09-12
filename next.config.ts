import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;

    // A missing/blank BACKEND_URL produces a destination like
    // "undefined/api/:path*", which Next.js rejects and fails the whole
    // build. Skip the rewrite instead so a misconfigured environment still
    // builds — API calls will 404 until BACKEND_URL is set, which is far
    // easier to diagnose than a build that won't ship at all.
    if (!backendUrl || !/^https?:\/\//.test(backendUrl)) {
      console.warn(
        `[next.config] BACKEND_URL is not set to a valid absolute URL (got: ${JSON.stringify(
          backendUrl
        )}). Skipping the /api rewrite — set BACKEND_URL in your environment (e.g. Vercel Project Settings → Environment Variables) for API calls to reach the backend.`
      );
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
