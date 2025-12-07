import { prisma } from '@/lib/prisma';

/**
 * Audit log utility for Chilean Law 20.584 compliance (Art. 14)
 * Records all access and modifications to patient data
 */

export type AuditAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
export type AuditResource = 'PATIENT' | 'APPOINTMENT' | 'MEDICATION' | 'TREATMENT' | 'HEALTH_METRIC';

interface AuditLogParams {
    userId: string;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    patientId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Create an audit log entry
 * @param params - Audit log parameters
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                resource: params.resource,
                resourceId: params.resourceId,
                patientId: params.patientId,
                details: params.details ? JSON.stringify(params.details) : null,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            },
        });
    } catch (error) {
        // Log error but don't throw - audit logging should not break app functionality
        console.error('[AUDIT LOG ERROR]', error);
    }
}

/**
 * Get audit logs for a specific patient
 * @param patientId - Patient ID
 * @param limit - Number of logs to retrieve
 */
export async function getPatientAuditLogs(patientId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

/**
 * Get audit logs for a specific user (who accessed what)
 * @param userId - User ID
 * @param limit - Number of logs to retrieve
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: Request): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    return realIp || undefined;
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string | undefined {
    return request.headers.get('user-agent') || undefined;
}
