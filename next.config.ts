import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.k-unirank.com" }],
        destination: "https://k-unirank.com/:path*",
        permanent: true,
      },
      {
        source: "/favicon.ico",
        destination: "/brand/k-unirank.png",
        permanent: true,
      },
      { source: "/admissions", destination: "/", permanent: true },
      { source: "/ranking/overall", destination: "/ranking/", permanent: true },
      { source: "/vs/overall", destination: "/vs/", permanent: true },
      { source: "/favorites", destination: "/mypage/", permanent: false },
      { source: "/accounts/login", destination: "/login/", permanent: false },
      { source: "/accounts/me", destination: "/mypage/", permanent: false },
    ];
  },
};

export default nextConfig;
