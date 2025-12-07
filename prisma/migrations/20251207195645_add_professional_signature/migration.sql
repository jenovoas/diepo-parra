-- CreateTable
CREATE TABLE "ProfessionalSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "documentHash" TEXT,
    CONSTRAINT "ProfessionalSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProfessionalSignature_userId_idx" ON "ProfessionalSignature"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalSignature_documentId_idx" ON "ProfessionalSignature"("documentId");

-- CreateIndex
CREATE INDEX "ProfessionalSignature_documentType_idx" ON "ProfessionalSignature"("documentType");
