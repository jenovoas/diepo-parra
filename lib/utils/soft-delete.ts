import { prisma } from '@/lib/prisma';
import { createAuditLog } from './audit';

/**
 * Soft Delete Utilities
 * Implements logical deletion for compliance with Ley 19.628 Art. 14
 * (Derecho de Cancelación)
 */

export interface SoftDeleteOptions {
    userId: string; // Who is deleting
    reason?: string; // Optional reason for deletion
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Soft delete a patient record
 */
export async function softDeletePatient(
    patientId: string,
    options: SoftDeleteOptions
) {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });

    if (!patient) {
        throw new Error('Patient not found');
    }

    if (patient.deletedAt) {
        throw new Error('Patient already deleted');
    }

    // Mark as deleted
    await prisma.patient.update({
        where: { id: patientId },
        data: {
            deletedAt: new Date(),
            deletedBy: options.userId,
        },
    });

    // Create audit log
    await createAuditLog({
        userId: options.userId,
        action: 'DELETE',
        resource: 'PATIENT',
        resourceId: patientId,
        patientId,
        details: {
            reason: options.reason,
            softDelete: true,
        },
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
    });

    return { success: true };
}

/**
 * Restore a soft-deleted patient
 */
export async function restorePatient(
    patientId: string,
    options: SoftDeleteOptions
) {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });

    if (!patient) {
        throw new Error('Patient not found');
    }

    if (!patient.deletedAt) {
        throw new Error('Patient is not deleted');
    }

    // Restore
    await prisma.patient.update({
        where: { id: patientId },
        data: {
            deletedAt: null,
            deletedBy: null,
        },
    });

    // Create audit log
    await createAuditLog({
        userId: options.userId,
        action: 'UPDATE',
        resource: 'PATIENT',
        resourceId: patientId,
        patientId,
        details: {
            action: 'restore',
            reason: options.reason,
        },
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
    });

    return { success: true };
}

/**
 * Permanently delete a patient (hard delete)
 * Should only be used after legal retention period
 */
export async function hardDeletePatient(
    patientId: string,
    options: SoftDeleteOptions
) {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            appointments: true,
            medications: true,
            treatments: true,
            healthMetrics: true,
            healthDeviceConnections: true,
        },
    });

    if (!patient) {
        throw new Error('Patient not found');
    }

    // Check if soft deleted
    if (!patient.deletedAt) {
        throw new Error('Patient must be soft deleted first');
    }

    // Check retention period (15 years for medical records in Chile)
    const deletedDate = new Date(patient.deletedAt);
    const retentionYears = 15;
    const retentionDate = new Date(deletedDate);
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);

    if (new Date() < retentionDate) {
        throw new Error(
            `Cannot permanently delete. Retention period until ${retentionDate.toLocaleDateString()}`
        );
    }

    // Create final audit log before deletion
    await createAuditLog({
        userId: options.userId,
        action: 'DELETE',
        resource: 'PATIENT',
        resourceId: patientId,
        patientId,
        details: {
            hardDelete: true,
            reason: options.reason,
            recordCount: {
                appointments: patient.appointments.length,
                medications: patient.medications.length,
                treatments: patient.treatments.length,
                healthMetrics: patient.healthMetrics.length,
            },
        },
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
    });

    // Delete all related records (cascade)
    await prisma.patient.delete({
        where: { id: patientId },
    });

    return { success: true };
}

/**
 * Get all soft-deleted patients
 */
export async function getSoftDeletedPatients() {
    return await prisma.patient.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },
        select: {
            id: true,
            fullName: true,
            deletedAt: true,
            deletedBy: true,
            createdAt: true,
        },
        orderBy: {
            deletedAt: 'desc',
        },
    });
}

/**
 * Middleware to exclude soft-deleted records
 * Use this in queries to automatically filter out deleted records
 */
export function excludeDeleted<T extends { deletedAt?: Date | null }>(
    records: T[]
): T[] {
    return records.filter(record => !record.deletedAt);
}

/**
 * Check if patient is deleted
 */
export async function isPatientDeleted(patientId: string): Promise<boolean> {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { deletedAt: true },
    });

    return !!patient?.deletedAt;
}
