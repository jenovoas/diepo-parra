/*
  Warnings:

  - You are about to drop the column `avatar` on the `Patient` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "birthDate" DATETIME NOT NULL,
    "occupation" TEXT,
    "address" TEXT,
    "gender" TEXT,
    "condition" TEXT,
    "anamnesis" TEXT,
    "surgicalHistory" TEXT,
    "pathologicalHistory" TEXT,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "evolutionNotes" TEXT,
    "consentMedical" BOOLEAN NOT NULL DEFAULT false,
    "consentContact" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "anamnesis", "birthDate", "condition", "consentContact", "consentDate", "consentMedical", "createdAt", "diagnosis", "evolutionNotes", "fullName", "gender", "id", "occupation", "pathologicalHistory", "phone", "surgicalHistory", "treatmentPlan", "updatedAt", "userId") SELECT "address", "anamnesis", "birthDate", "condition", "consentContact", "consentDate", "consentMedical", "createdAt", "diagnosis", "evolutionNotes", "fullName", "gender", "id", "occupation", "pathologicalHistory", "phone", "surgicalHistory", "treatmentPlan", "updatedAt", "userId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
