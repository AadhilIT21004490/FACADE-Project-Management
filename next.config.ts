import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Mongoose uses some Node.js modules not available in edge runtime
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
