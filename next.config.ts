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
    // antd & deps
    "@ant-design",
    "@rc-component",
    "antd",
    "rc-cascader",
    "rc-checkbox",
    "rc-collapse",
    "rc-dialog",
    "rc-drawer",
    "rc-dropdown",
    "rc-field-form",
    "rc-image",
    "rc-input",
    "rc-input-number",
    "rc-mentions",
    "rc-menu",
    "rc-motion",
    "rc-notification",
    "rc-pagination",
    "rc-picker",
    "rc-progress",
    "rc-rate",
    "rc-resize-observer",
    "rc-segmented",
    "rc-select",
    "rc-slider",
    "rc-steps",
    "rc-switch",
    "rc-table",
    "rc-tabs",
    "rc-textarea",
    "rc-tooltip",
    "rc-tree",
    "rc-tree-select",
    "rc-upload",
    "rc-util",
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://navisworkbe.harmony-at.com/api/:path*", // Proxy tới BE thật
      },
    ];
  },
};

export default nextConfig;
