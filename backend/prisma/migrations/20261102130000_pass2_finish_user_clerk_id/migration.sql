-- Pass Two finish: link application users to their Clerk identity.
-- clerkId is nullable so legacy (seeded/migrated) rows keep working until
-- tenant resolution backfills the link on first authenticated contact.
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
