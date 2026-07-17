import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/ffmpeg-static/ffmpeg*",
      "./node_modules/ffprobe-static/bin/**/*",
      "./node_modules/yt-dlp-exec/bin/**/*"
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" }
    ]
  }
};

export default nextConfig;
