-- =====================================================
-- Rumo Pragas IA - Consolidated Schema
-- Generated from migrations 1-12 (2026-04-16)
--
-- This file represents the FINAL state of the database
-- after all migrations have been applied. It is for
-- reference only — use migrations for actual changes.
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Tabela de diagnosticos
CREATE TABLE IF NOT EXISTS pragas_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  pest_id TEXT,
  pest_name TEXT,
  confidence DOUBLE PRECISION,
  severity TEXT CHECK (severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')),
  image_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS pragas_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'produtor',
  city TEXT,
  state TEXT,
  crops TEXT[],
  push_token TEXT,
  deletion_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de assinaturas (multi-plataforma)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'expired', 'paused')),
  provider TEXT NOT NULL DEFAULT 'free' CHECK (provider IN ('free', 'apple', 'google', 'stripe', 'promotional')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  apple_transaction_id TEXT,
  google_purchase_token TEXT,
  revenuecat_product_id TEXT,
  revenuecat_environment TEXT CHECK (revenuecat_environment IS NULL OR revenuecat_environment IN ('SANDBOX', 'PRODUCTION')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Analytics events table for server-side event ingestion
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  platform TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log table for tracking important actions (LGPD compliance)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences — explicit opt-in for sharing location (LGPD)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  share_location BOOLEAN NOT NULL DEFAULT false,
  share_location_purpose TEXT,
  consented_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_preferences IS
  'User-level privacy preferences. Controls opt-in flags such as location sharing for LGPD compliance.';
COMMENT ON COLUMN user_preferences.share_location IS
  'LGPD opt-in flag. When true, edge functions may read/persist the user location for improved diagnosis and regional alerts.';
COMMENT ON COLUMN user_preferences.share_location_purpose IS
  'Free-text justification shown to the user at consent time (kept for audit).';
COMMENT ON COLUMN user_preferences.consented_at IS
  'Timestamp when the user granted (or revoked) consent.';

-- MCP API Tokens — shared project tokens
CREATE TABLE IF NOT EXISTS mcp_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_slug TEXT NOT NULL CHECK (app_slug IN ('rumo-pragas','campo-vivo','rumo-finance','rumo-confinamento','rumo-operacional')),
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT array[]::text[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  rate_limit_per_min INT NOT NULL DEFAULT 30,
  notes TEXT
);

COMMENT ON TABLE mcp_api_tokens IS 'Tokens de API dos MCP servers (x-ia-hub-token). Admin-only, service_role apenas.';
COMMENT ON COLUMN mcp_api_tokens.token_hash IS 'SHA-256 hex do token. NUNCA plaintext.';
COMMENT ON COLUMN mcp_api_tokens.scopes IS 'Lista de tools permitidas (vazio = todas).';
COMMENT ON COLUMN mcp_api_tokens.app_slug IS 'App alvo do token (um token vale apenas para um app).';

-- =====================================================
-- INDEXES
-- =====================================================

-- pragas_diagnoses
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON pragas_diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_created ON pragas_diagnoses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON pragas_diagnoses(crop);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON pragas_diagnoses(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnoses_pest_id ON pragas_diagnoses(pest_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_severity ON pragas_diagnoses(severity);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- pragas_profiles
-- Note: idx_profiles_user_id removed (redundant with PK on id)
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requested ON pragas_profiles(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL;

-- analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_timestamp ON analytics_events(event, timestamp);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON audit_log(user_id, created_at DESC);

-- mcp_api_tokens
CREATE INDEX IF NOT EXISTS mcp_api_tokens_app_idx ON mcp_api_tokens(app_slug);
CREATE INDEX IF NOT EXISTS mcp_api_tokens_active_idx ON mcp_api_tokens(revoked_at) WHERE revoked_at IS null;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE pragas_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pragas_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_api_tokens ENABLE ROW LEVEL SECURITY;

-- Diagnosticos: usuarios so veem/editam os seus
CREATE POLICY "Users can view own diagnoses"
  ON pragas_diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnoses"
  ON pragas_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnoses"
  ON pragas_diagnoses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnoses"
  ON pragas_diagnoses FOR DELETE
  USING (auth.uid() = user_id);

-- Perfis: usuarios so veem/editam o seu
CREATE POLICY "Users can view own profile"
  ON pragas_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON pragas_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON pragas_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assinaturas: usuarios so veem a sua
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Assinaturas: apenas service_role pode inserir/atualizar (via Edge Functions/webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Analytics: users can read own events
CREATE POLICY "Users can read own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Audit log: users can read own entries (LGPD right of access)
CREATE POLICY "Users can read own audit log"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- User preferences: full CRUD on own row
CREATE POLICY "user_preferences_select_own"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;

-- mcp_api_tokens: no authenticated/anon policies — admin-only via service_role

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Trigger para criar perfil automaticamente apos signup
-- FINAL version (migration 5, v3): only inserts into pragas_profiles.
-- Subscriptions are managed by Edge Functions / webhooks, NOT the trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pragas_profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON pragas_profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON pragas_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- User preferences updated_at trigger
CREATE OR REPLACE FUNCTION public.user_preferences_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_preferences_touch_updated_at ON user_preferences;
CREATE TRIGGER user_preferences_touch_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.user_preferences_touch_updated_at();
