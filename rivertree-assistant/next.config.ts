import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["unpdf", "mammoth", "nodemailer"],
};

export default nextConfig;
