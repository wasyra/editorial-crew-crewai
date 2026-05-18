export const vetaSeed = {
  appName: "web",
  pack: "launch",
  metrics: [
    { label: "Revenue", value: "$48.2k", delta: "+12.4%" },
    { label: "Active users", value: "8,492", delta: "+7.1%" },
    { label: "Conversion", value: "6.8%", delta: "+1.2%" },
  ],
  invoices: [
    { id: "INV-1008", customer: "Acme Studio", status: "paid", amount: "$1,240" },
    { id: "INV-1009", customer: "Northstar Labs", status: "open", amount: "$860" },
    { id: "INV-1010", customer: "Riverline", status: "draft", amount: "$430" },
  ],
  posts: [
    { slug: "launch-notes", title: "Launch notes", description: "How this Veta app is structured." },
    { slug: "growth-loop", title: "Growth loop", description: "Turn product signals into faster iteration." },
  ],
} as const;
