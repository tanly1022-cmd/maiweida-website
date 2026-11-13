import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // Static hosting has no Next.js server. Configure security headers at the host.
};

export default config;
