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
    "bloodType" TEXT,
    "allergies" TEXT,
    "chronicConditions" TEXT,
    "emergencyContact" TEXT,
    "insuranceInfo" TEXT,
    "condition" TEXT,
    "anamnesis" TEXT,
    "surgicalHistory" TEXT,
    "pathologicalHistory" TEXT,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "evolutionNotes" TEXT,
    "consentMedical" BOOLEAN NOT NULL DEFAULT false,
    "consentContact" BOOLEAN NOT NULL DEFAULT false,
    "consentDataProcessing" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentUpdatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "allergies", "anamnesis", "birthDate", "bloodType", "chronicConditions", "condition", "consentContact", "consentDataProcessing", "consentDate", "consentMedical", "consentUpdatedAt", "createdAt", "diagnosis", "emergencyContact", "evolutionNotes", "fullName", "gender", "id", "insuranceInfo", "occupation", "pathologicalHistory", "phone", "surgicalHistory", "treatmentPlan", "updatedAt", "userId") SELECT "address", "allergies", "anamnesis", "birthDate", "bloodType", "chronicConditions", "condition", "consentContact", "consentDataProcessing", "consentDate", "consentMedical", "consentUpdatedAt", "createdAt", "diagnosis", "emergencyContact", "evolutionNotes", "fullName", "gender", "id", "insuranceInfo", "occupation", "pathologicalHistory", "phone", "surgicalHistory", "treatmentPlan", "updatedAt", "userId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
