import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.1.110:3000"],
  experimental: {
    externalDir: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  outputFileTracingIncludes: {
    "/api/**/*": [
      "../../node_modules/ffmpeg-static/ffmpeg*",
      "../../node_modules/ffprobe-static/bin/**/*",
      "../../node_modules/yt-dlp-exec/bin/**/*",
      "../../vendor/yt-dlp/**/*",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
