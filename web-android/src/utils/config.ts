export const Config = {
  supabaseURL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  toolkitURL: process.env.EXPO_PUBLIC_TOOLKIT_URL || '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_KEY || '',
};

// Validate required config at startup (dev only)
if (__DEV__) {
  const required = ['supabaseURL', 'supabaseAnonKey'] as const;
  for (const key of required) {
    if (!Config[key]) {
      console.warn(
        `[Config] Variável ${key} não configurada. Verifique seu arquivo .env`,
      );
    }
  }
}

declare const __DEV__: boolean;
