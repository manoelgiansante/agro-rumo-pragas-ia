-- =====================================================
-- Fix: Update provider CHECK constraint for RevenueCat webhook compatibility
-- The revenuecat-webhook sends provider='promotional' for PROMOTIONAL store type,
-- which violates the original CHECK constraint.
-- =====================================================

-- Drop old constraint and recreate with 'promotional' included
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_provider_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IN ('free', 'apple', 'google', 'stripe', 'promotional'));
