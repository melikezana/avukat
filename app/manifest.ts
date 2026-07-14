import type { MetadataRoute } from "next";
import { siteDefaults } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteDefaults.name,
    short_name: "İdris Dağkesen",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: siteDefaults.backgroundColor,
    theme_color: siteDefaults.themeColor,
    lang: siteDefaults.lang,
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
