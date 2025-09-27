-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Receipt_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "LocalVendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Receipt" ("category", "fileName", "fileSize", "id", "mimeType", "ocrConfidence", "project", "receiptDate", "subtotal", "tax", "total", "uploadDate", "vendorId", "verified") SELECT "category", "fileName", "fileSize", "id", "mimeType", "ocrConfidence", "project", "receiptDate", "subtotal", "tax", "total", "uploadDate", "vendorId", "verified" FROM "Receipt";
DROP TABLE "Receipt";
ALTER TABLE "new_Receipt" RENAME TO "Receipt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
