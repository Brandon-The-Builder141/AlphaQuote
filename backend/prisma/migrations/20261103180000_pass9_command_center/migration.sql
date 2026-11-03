-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "saleDate" TIMESTAMP(3),
    "salePrice" DECIMAL(65,30),
    "acres" DOUBLE PRECISION,
    "parcelId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Auditor sales',
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractorAccountId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractorAccountId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "OpsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayCard" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mustWin" TEXT NOT NULL DEFAULT '',
    "brick" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractorAccountId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "DayCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_contractorAccountId_parcelId_key" ON "Lead"("contractorAccountId", "parcelId");

-- CreateIndex
CREATE UNIQUE INDEX "DayCard_contractorAccountId_date_key" ON "DayCard"("contractorAccountId", "date");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsItem" ADD CONSTRAINT "OpsItem_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsItem" ADD CONSTRAINT "OpsItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayCard" ADD CONSTRAINT "DayCard_contractorAccountId_fkey" FOREIGN KEY ("contractorAccountId") REFERENCES "ContractorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayCard" ADD CONSTRAINT "DayCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

