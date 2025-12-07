import CryptoJS from 'crypto-js';

/**
 * Encryption utilities for sensitive medical data
 * Complies with Chilean Law 19.628 and 20.584
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY must be set in production');
}

/**
 * Encrypt sensitive data
 * @param data - Plain text data to encrypt
 * @returns Encrypted string
 */
export function encrypt(data: string): string {
    if (!data) return '';
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted string
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
    if (!encryptedData) return '';
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt an object's sensitive fields
 * @param obj - Object with sensitive data
 * @param fields - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const encrypted = { ...obj };
    fields.forEach(field => {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            encrypted[field] = encrypt(encrypted[field] as string) as T[keyof T];
        }
    });
    return encrypted;
}

/**
 * Decrypt an object's encrypted fields
 * @param obj - Object with encrypted data
 * @param fields - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const decrypted = { ...obj };
    fields.forEach(field => {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            decrypted[field] = decrypt(decrypted[field] as string) as T[keyof T];
        }
    });
    return decrypted;
}

/**
 * Hash sensitive data (one-way, for comparison only)
 * @param data - Data to hash
 * @returns Hashed string
 */
export function hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
}

/**
 * Redact sensitive data from logs
 * @param obj - Object that may contain sensitive data
 * @returns Object with sensitive fields redacted
 */
export function redactSensitiveData<T extends Record<string, any>>(obj: T): Partial<T> {
    const sensitiveFields = [
        'password',
        'passwordHash',
        'token',
        'accessToken',
        'refreshToken',
        'condition',
        'anamnesis',
        'surgicalHistory',
        'pathologicalHistory',
        'diagnosis',
        'treatmentPlan',
        'evolutionNotes',
        'medications',
        'allergies'
    ];

    const redacted: any = { ...obj };
    Object.keys(redacted).forEach(key => {
        if (sensitiveFields.includes(key.toLowerCase())) {
            redacted[key] = '[REDACTED]';
        }
    });
    return redacted;
}
