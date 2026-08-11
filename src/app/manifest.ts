import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tracker",
    short_name: "tt",
    description: "Professional time tracking and project clarity for focused teams.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#635bff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
