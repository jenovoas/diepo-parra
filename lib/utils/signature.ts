import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Signature Utilities
 * Handles creation and verification of digital signatures
 * Complies with Ley 20.584 (Electronic Medical Records)
 */

export interface CreateSignatureOptions {
    userId: string;
    signatureData: string; // Base64 PNG
    documentType: 'APPOINTMENT' | 'TREATMENT' | 'PRESCRIPTION' | 'MEDICAL_REPORT';
    documentId: string;
    documentContent?: string; // For hash generation
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Generate SHA-256 hash of document
 */
export function generateDocumentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create a professional signature
 */
export async function createSignature(options: CreateSignatureOptions) {
    const {
        userId,
        signatureData,
        documentType,
        documentId,
        documentContent,
        ipAddress,
        userAgent,
    } = options;

    // Generate document hash if content provided
    const documentHash = documentContent
        ? generateDocumentHash(documentContent)
        : null;

    const signature = await prisma.professionalSignature.create({
        data: {
            userId,
            signatureData,
            documentType,
            documentId,
            documentHash,
            ipAddress,
            userAgent,
        },
    });

    return signature;
}

/**
 * Get signature for a document
 */
export async function getSignature(documentType: string, documentId: string) {
    return await prisma.professionalSignature.findFirst({
        where: {
            documentType,
            documentId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            signedAt: 'desc',
        },
    });
}

/**
 * Verify signature integrity
 */
export async function verifySignature(
    signatureId: string,
    currentDocumentContent: string
): Promise<{ valid: boolean; reason?: string }> {
    const signature = await prisma.professionalSignature.findUnique({
        where: { id: signatureId },
    });

    if (!signature) {
        return { valid: false, reason: 'Signature not found' };
    }

    // If no hash was stored, we can't verify
    if (!signature.documentHash) {
        return { valid: true, reason: 'No hash available for verification' };
    }

    // Generate hash of current content
    const currentHash = generateDocumentHash(currentDocumentContent);

    // Compare hashes
    if (currentHash !== signature.documentHash) {
        return {
            valid: false,
            reason: 'Document has been modified after signing',
        };
    }

    return { valid: true };
}

/**
 * Get all signatures by a professional
 */
export async function getSignaturesByProfessional(userId: string) {
    return await prisma.professionalSignature.findMany({
        where: { userId },
        orderBy: {
            signedAt: 'desc',
        },
        take: 50,
    });
}

/**
 * Check if document is signed
 */
export async function isDocumentSigned(
    documentType: string,
    documentId: string
): Promise<boolean> {
    const signature = await prisma.professionalSignature.findFirst({
        where: {
            documentType,
            documentId,
        },
    });

    return !!signature;
}
