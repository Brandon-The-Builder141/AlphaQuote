-- Pass Two (lockdown): tenant-scope FollowUpReminder like every other
-- multi-user model so follow-up reminders can be filtered by owner.
ALTER TABLE "FollowUpReminder" ADD COLUMN "contractorAccountId" TEXT;
ALTER TABLE "FollowUpReminder" ADD COLUMN "createdById" TEXT;
