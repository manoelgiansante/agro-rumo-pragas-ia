-- =====================================================
-- Missing indexes found during audit 2026-04-16
-- =====================================================

-- Indexes for common diagnosis filter queries
CREATE INDEX IF NOT EXISTS idx_diagnoses_pest_id ON pragas_diagnoses(pest_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_severity ON pragas_diagnoses(severity);

-- Indexes for subscription lookup by provider/status
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Remove redundant index (PK already indexes pragas_profiles.id)
DROP INDEX IF EXISTS idx_profiles_user_id;

-- Composite for audit trail queries (user + time-ordered)
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON audit_log(user_id, created_at DESC);
