import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  /* config options here */

  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/docs/guides",
        permanent: false,
      },
    ];
  },
};

export default withContentCollections(nextConfig);
