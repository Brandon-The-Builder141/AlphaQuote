-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "templateId" TEXT,
    CONSTRAINT "FollowUpReminder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FollowUpTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUpTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
