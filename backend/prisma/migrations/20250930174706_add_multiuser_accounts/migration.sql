/*
  Warnings:

  - Added the required column `contractorAccountId` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorAccountId` to the `FollowUpTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorAccountId` to the `LocalVendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorAccountId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorAccountId` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorAccountId` to the `TaskTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ContractorAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contractorAccountId" TEXT NOT NULL,
    CONSTRAINT "User_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estimateType" TEXT NOT NULL,
    "totalCost" DECIMAL NOT NULL,
    "markup" DECIMAL NOT NULL DEFAULT 15,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomData" TEXT,
    "aiResponse" TEXT,
    "pdfPath" TEXT,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Estimate_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estimate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Estimate" ("aiResponse", "createdAt", "estimateType", "id", "markup", "pdfPath", "projectId", "roomData", "totalCost") SELECT "aiResponse", "createdAt", "estimateType", "id", "markup", "pdfPath", "projectId", "roomData", "totalCost" FROM "Estimate";
DROP TABLE "Estimate";
ALTER TABLE "new_Estimate" RENAME TO "Estimate";
CREATE TABLE "new_FollowUpTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "FollowUpTemplate_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUpTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FollowUpTemplate" ("createdAt", "id", "isDefault", "message", "name", "subject", "updatedAt", "userId") SELECT "createdAt", "id", "isDefault", "message", "name", "subject", "updatedAt", "userId" FROM "FollowUpTemplate";
DROP TABLE "FollowUpTemplate";
ALTER TABLE "new_FollowUpTemplate" RENAME TO "FollowUpTemplate";
CREATE TABLE "new_LocalVendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "LocalVendor_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LocalVendor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LocalVendor" ("contact", "createdAt", "id", "name", "notes", "updatedAt") SELECT "contact", "createdAt", "id", "name", "notes", "updatedAt" FROM "LocalVendor";
DROP TABLE "LocalVendor";
ALTER TABLE "new_LocalVendor" RENAME TO "LocalVendor";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "address" TEXT,
    "jobType" TEXT,
    "description" TEXT,
    "timeline" TEXT,
    "budget" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Project_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("address", "budget", "clientEmail", "clientName", "clientPhone", "createdAt", "description", "id", "jobType", "name", "status", "timeline", "updatedAt") SELECT "address", "budget", "clientEmail", "clientName", "clientPhone", "createdAt", "description", "id", "jobType", "name", "status", "timeline", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "receiptDate" DATETIME NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL NOT NULL,
    "subtotal" DECIMAL,
    "tax" DECIMAL,
    "category" TEXT DEFAULT 'General',
    "project" TEXT,
    "projectId" TEXT,
    "ocrConfidence" REAL NOT NULL DEFAULT 0.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "Receipt_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "LocalVendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Receipt_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Receipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Receipt" ("category", "fileName", "fileSize", "id", "mimeType", "ocrConfidence", "project", "projectId", "receiptDate", "subtotal", "tax", "total", "uploadDate", "vendorId", "verified") SELECT "category", "fileName", "fileSize", "id", "mimeType", "ocrConfidence", "project", "projectId", "receiptDate", "subtotal", "tax", "total", "uploadDate", "vendorId", "verified" FROM "Receipt";
DROP TABLE "Receipt";
ALTER TABLE "new_Receipt" RENAME TO "Receipt";
CREATE TABLE "new_TaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contractorAccountId" TEXT NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "TaskTemplate_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TaskTemplate" ("category", "createdAt", "description", "id", "isPublic", "name", "updatedAt", "userId") SELECT "category", "createdAt", "description", "id", "isPublic", "name", "updatedAt", "userId" FROM "TaskTemplate";
DROP TABLE "TaskTemplate";
ALTER TABLE "new_TaskTemplate" RENAME TO "TaskTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ContractorAccount_email_key" ON "ContractorAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
