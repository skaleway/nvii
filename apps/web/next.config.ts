import type { NextConfig } from "next";
// @ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { siteConfig } from "@/lib/site";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "rxxsrjqal9.ufs.sh",
        protocol: "https",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: siteConfig.links.github,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
