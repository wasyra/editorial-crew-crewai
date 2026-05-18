#!/usr/bin/env node
const [kit, provider = "mock"] = process.argv.slice(2);

const packages = {
  auth: "@vetaui/auth-kit",
  payments: "@vetaui/payments-kit",
  blog: "@vetaui/blog-kit",
  charts: "@vetaui/charts-kit recharts",
  forms: "@vetaui/forms-kit react-hook-form zod",
  analytics: "@vetaui/analytics-kit",
  feedback: "@vetaui/feedback-kit",
  notifications: "@vetaui/notifications-kit",
  search: "@vetaui/search-kit",
  storage: "@vetaui/storage-kit",
};

if (!kit || !packages[kit]) {
  console.log("Usage: pnpm veta:add <kit> [provider]");
  console.log("Kits:", Object.keys(packages).join(", "));
  process.exit(kit ? 1 : 0);
}

console.log("Install:");
console.log(`  pnpm add ${packages[kit]}`);
console.log("");
console.log("Then ask your agent:");
console.log(`  Use Veta MCP to add ${kit} with provider ${provider} to this app. Start with veta_app_plan, then veta_get_component for visible sections.`);
