-- Live fixes (2026-11-02): one-time company setup completion is tracked
-- server-side on the User row so it survives re-login and new devices.
-- Nullable: existing users read as "setup not completed" until they finish
-- (or re-finish) the single setup step.
ALTER TABLE "User" ADD COLUMN "setupCompletedAt" DATETIME;
