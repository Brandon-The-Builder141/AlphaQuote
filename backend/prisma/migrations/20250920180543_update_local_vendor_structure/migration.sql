/*
  Warnings:

  - You are about to drop the column `address` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `lastPurchase` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `storeNumber` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `totalPurchases` on the `LocalVendor` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `LocalVendor` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `LocalVendor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_LocalVendorToMaterial" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LocalVendorToMaterial_A_fkey" FOREIGN KEY ("A") REFERENCES "LocalVendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LocalVendorToMaterial_B_fkey" FOREIGN KEY ("B") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LocalVendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LocalVendor" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "LocalVendor";
DROP TABLE "LocalVendor";
ALTER TABLE "new_LocalVendor" RENAME TO "LocalVendor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_LocalVendorToMaterial_AB_unique" ON "_LocalVendorToMaterial"("A", "B");

-- CreateIndex
CREATE INDEX "_LocalVendorToMaterial_B_index" ON "_LocalVendorToMaterial"("B");
