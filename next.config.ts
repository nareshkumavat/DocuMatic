import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export', // Commented out to enable API Routes
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
