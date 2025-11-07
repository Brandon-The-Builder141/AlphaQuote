-- CreateTable
CREATE TABLE "RegionalPricePack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegionalMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pricePackId" TEXT NOT NULL,
    "materialKey" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "unitLabel" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegionalMaterial_pricePackId_fkey" FOREIGN KEY ("pricePackId") REFERENCES "RegionalPricePack" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRegionalSelection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "pricePackId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserRegionalSelection_pricePackId_fkey" FOREIGN KEY ("pricePackId") REFERENCES "RegionalPricePack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionalMaterial_pricePackId_materialKey_key" ON "RegionalMaterial"("pricePackId", "materialKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegionalSelection_userId_key" ON "UserRegionalSelection"("userId");
