import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const Config = {
  SUPABASE_URL: extra.SUPABASE_URL || 'https://jxcnfyeemdltdfqtgbcl.supabase.co',
  SUPABASE_ANON_KEY: extra.SUPABASE_ANON_KEY || '',
  TOOLKIT_URL: extra.TOOLKIT_URL || '',
};
