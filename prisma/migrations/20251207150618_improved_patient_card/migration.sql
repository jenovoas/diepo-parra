/*
  Warnings:

  - You are about to drop the column `medicalHistory` on the `Patient` table. All the data in the column will be lost.

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
    "avatar" TEXT,
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
INSERT INTO "new_Patient" ("birthDate", "condition", "consentContact", "consentDate", "consentMedical", "createdAt", "fullName", "id", "phone", "updatedAt", "userId") SELECT "birthDate", "condition", "consentContact", "consentDate", "consentMedical", "createdAt", "fullName", "id", "phone", "updatedAt", "userId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("createdAt", "date", "id", "notes", "patientId", "serviceType", "status", "updatedAt") SELECT "createdAt", "date", "id", "notes", "patientId", "serviceType", "status", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
