import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/brand/k-unirank.png",
        permanent: true,
      },
      { source: "/admissions", destination: "/", permanent: true },
      { source: "/ranking/overall", destination: "/ranking/", permanent: true },
      { source: "/login", destination: "/accounts/login/", permanent: false },
      { source: "/favorites", destination: "/accounts/me/", permanent: false },
    ];
  },
};

export default nextConfig;
