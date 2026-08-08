import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nyakizu Digital Market",
    short_name: "Nyakizu",
    description:
      "Digitising trusted phone accessories trade for the Banyamulenge community in Kenya.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    lang: "sw",
    dir: "ltr",
    categories: ["business", "shopping"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "My Suppliers",
        short_name: "Suppliers",
        url: "/buyer/suppliers",
        description: "View your trusted suppliers",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "New Order",
        short_name: "Order",
        url: "/buyer/lists/new",
        description: "Start a new order",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "My Store",
        short_name: "Store",
        url: "/seller/dashboard",
        description: "Manage your seller dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
