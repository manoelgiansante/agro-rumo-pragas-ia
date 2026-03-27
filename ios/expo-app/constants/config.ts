export const Config = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jxcnfyeemdltdfqtgbcl.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '',
  RESEND_API_KEY: process.env.EXPO_PUBLIC_RESEND_API_KEY || '',
};
