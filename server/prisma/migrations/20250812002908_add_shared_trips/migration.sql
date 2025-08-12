-- CreateTable
CREATE TABLE "SharedTrip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT,
    "shareMethod" TEXT NOT NULL,
    "shareUrl" TEXT,
    "sharedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SharedTrip_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SharedTrip_tripId_idx" ON "SharedTrip"("tripId");

-- CreateIndex
CREATE INDEX "SharedTrip_sharedBy_idx" ON "SharedTrip"("sharedBy");

-- CreateIndex
CREATE INDEX "SharedTrip_sharedAt_idx" ON "SharedTrip"("sharedAt");
