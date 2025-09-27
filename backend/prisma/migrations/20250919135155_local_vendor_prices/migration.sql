-- CreateTable
CREATE TABLE "LocalVendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "storeNumber" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "category" TEXT DEFAULT 'General',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPurchase" DATETIME,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "LocalVendorPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "materialKey" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "unitLabel" TEXT NOT NULL,
    "category" TEXT DEFAULT 'General',
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptId" TEXT,
    CONSTRAINT "LocalVendorPrice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "LocalVendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LocalVendorPrice_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "receiptDate" DATETIME NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL NOT NULL,
    "subtotal" DECIMAL,
    "tax" DECIMAL,
    "category" TEXT DEFAULT 'General',
    "project" TEXT,
    "ocrConfidence" REAL NOT NULL DEFAULT 0.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    CONSTRAINT "Receipt_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "LocalVendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "quantity" DECIMAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "totalPrice" DECIMAL NOT NULL,
    "sku" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedCost" DECIMAL NOT NULL DEFAULT 0,
    "actualCost" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "localVendorId" TEXT,
    "projectId" TEXT,
    CONSTRAINT "Task_localVendorId_fkey" FOREIGN KEY ("localVendorId") REFERENCES "LocalVendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estimateType" TEXT NOT NULL,
    "totalCost" DECIMAL NOT NULL,
    "markup" DECIMAL NOT NULL DEFAULT 15,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomData" TEXT,
    "aiResponse" TEXT,
    "pdfPath" TEXT,
    CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalVendor_name_location_key" ON "LocalVendor"("name", "location");

-- CreateIndex
CREATE UNIQUE INDEX "LocalVendorPrice_vendorId_materialKey_key" ON "LocalVendorPrice"("vendorId", "materialKey");
