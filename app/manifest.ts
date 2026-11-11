import type { MetadataRoute } from "next";

/** Lets phones "Add to Home Screen" / install TechNest as an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TechNest — Nigerian Gadget Marketplace",
    short_name: "TechNest",
    description: "Buy, sell and swap gadgets at fair Nigerian market prices",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf6ef",
    theme_color: "#fbf6ef",
    categories: ["shopping", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Flash Sales", url: "/flash-sales", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Shop by category", url: "/buy?condition=uk-used", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Value my device", url: "/value", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Cart", url: "/cart", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
