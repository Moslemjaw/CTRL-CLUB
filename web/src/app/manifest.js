export default function manifest() {
  return {
    id: "/",
    name: "CTRL | Coding, Technology and Robotics League",
    short_name: "CTRL",
    description: "CTRL Club events by the AASU Programming Club",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#00032E",
    background_color: "#00032E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
