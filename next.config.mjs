import { fileURLToPath } from "node:url";
export default {
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "strict-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
