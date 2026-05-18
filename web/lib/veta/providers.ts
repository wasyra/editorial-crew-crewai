export const appProvider = "mock" as const;
export const paymentsProvider = "mock" as const;

export const providerNotes = {
  mock: "Runs immediately with local mock data.",
  firebase: "Use generated Firebase files and .env.local values.",
  supabase: "Install Supabase client and wire app-specific auth/data adapters.",
  stripe: "Create payment intents on your backend before confirming payment.",
  mercadoPago: "Create preferences on your backend and redirect to init_point.",
} as const;
