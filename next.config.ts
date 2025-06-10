import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transpilePackages: [
  //   "antd",
  //   "@ant-design",
  //   "rc-util",
  //   "rc-pagination",
  //   "rc-picker",
  //   "rc-notification",
  //   "rc-tooltip",
  //   "rc-tree",
  //   "rc-table",
  // ],
  transpilePackages: [
    "antd",
    "@ant-design",
    "rc-component",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-notification",
    "rc-tooltip",
    "rc-tree",
    "rc-table",
  ],

  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "https://navisworkbe.harmony-at.com/api/:path*", // Proxy tới BE thật
  //     },
  //   ];
  // },
};

export default nextConfig;
