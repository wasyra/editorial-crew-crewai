import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vetaui/foundations","@vetaui/atoms","@vetaui/molecules","@vetaui/organisms","@vetaui/templates","@vetaui/forms-kit","@vetaui/feedback-kit","@vetaui/analytics-kit","@vetaui/email-kit"],
};

export default config;
