import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/utils/encryption';

/**
 * Google Fit Integration
 * Docs: https://developers.google.com/fit/rest/v1/get-started
 */

const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.body.read',
];

export class GoogleFitClient {
    private oauth2Client: OAuth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_FIT_CLIENT_ID,
            process.env.GOOGLE_FIT_CLIENT_SECRET,
            `${process.env.NEXTAUTH_URL}/api/health-devices/callback/google`
        );
    }

    /**
     * Get authorization URL for OAuth flow
     */
    getAuthUrl(patientId: string): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state: patientId, // Pass patient ID to callback
            prompt: 'consent', // Force consent screen to get refresh token
        });
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokensFromCode(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Save connection to database
     */
    async saveConnection(patientId: string, tokens: any) {
        const encryptedAccessToken = encrypt(tokens.access_token || '');
        const encryptedRefreshToken = encrypt(tokens.refresh_token || '');

        await prisma.healthDeviceConnection.upsert({
            where: {
                patientId_provider: {
                    patientId,
                    provider: 'GOOGLE',
                },
            },
            create: {
                patientId,
                provider: 'GOOGLE',
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                isActive: true,
            },
            update: {
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                isActive: true,
            },
        });
    }

    /**
     * Get connection from database
     */
    async getConnection(patientId: string) {
        return await prisma.healthDeviceConnection.findUnique({
            where: {
                patientId_provider: {
                    patientId,
                    provider: 'GOOGLE',
                },
            },
        });
    }

    /**
     * Refresh access token if expired
     */
    async refreshAccessToken(connection: any) {
        const refreshToken = decrypt(connection.refreshToken || '');
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });

        const { credentials } = await this.oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
            throw new Error('Failed to refresh Google Fit access token');
        }

        // Update tokens in database
        await prisma.healthDeviceConnection.update({
            where: { id: connection.id },
            data: {
                accessToken: encrypt(credentials.access_token || ''),
                expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
            },
        });

        return credentials.access_token;
    }

    /**
     * Get valid access token (refresh if needed)
     */
    async getValidAccessToken(patientId: string): Promise<string> {
        const connection = await this.getConnection(patientId);

        if (!connection) {
            throw new Error('No Google Fit connection found');
        }

        // Check if token is expired
        const now = new Date();
        if (connection.expiresAt && connection.expiresAt <= now) {
            return await this.refreshAccessToken(connection);
        }

        return decrypt(connection.accessToken || '');
    }

    /**
     * Fetch step count data
     */
    async fetchSteps(patientId: string, startDate: Date, endDate: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        this.oauth2Client.setCredentials({ access_token: accessToken });

        const fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });

        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: 'com.google.step_count.delta',
                }],
                bucketByTime: { durationMillis: "86400000" }, // 1 day
                startTimeMillis: startDate.getTime().toString(),
                endTimeMillis: endDate.getTime().toString(),
            },
        } as any);

        return this.parseStepsData(response.data);
    }

    /**
     * Fetch heart rate data
     */
    async fetchHeartRate(patientId: string, startDate: Date, endDate: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        this.oauth2Client.setCredentials({ access_token: accessToken });

        const fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });

        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: 'com.google.heart_rate.bpm',
                }],
                bucketByTime: { durationMillis: "86400000" },
                startTimeMillis: startDate.getTime().toString(),
                endTimeMillis: endDate.getTime().toString(),
            },
        } as any);

        return this.parseHeartRateData(response.data);
    }

    /**
     * Fetch sleep data
     */
    async fetchSleep(patientId: string, startDate: Date, endDate: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        this.oauth2Client.setCredentials({ access_token: accessToken });

        const fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });

        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: 'com.google.sleep.segment',
                }],
                bucketByTime: { durationMillis: "86400000" },
                startTimeMillis: startDate.getTime().toString(),
                endTimeMillis: endDate.getTime().toString(),
            },
        });

        return this.parseSleepData(response.data);
    }

    /**
     * Sync all metrics for a patient
     */
    async syncAllMetrics(patientId: string) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        try {
            // Fetch all metrics
            const [steps, heartRate, sleep] = await Promise.all([
                this.fetchSteps(patientId, startDate, endDate),
                this.fetchHeartRate(patientId, startDate, endDate),
                this.fetchSleep(patientId, startDate, endDate),
            ]);

            // Save to database
            const metrics = [...steps, ...heartRate, ...sleep];

            for (const metric of metrics) {
                await prisma.healthMetric.create({
                    data: {
                        patientId,
                        type: metric.type,
                        value: metric.value,
                        unit: metric.unit,
                        source: 'GOOGLE_FIT',
                        recordedAt: metric.recordedAt,
                    },
                });
            }

            // Update last sync time
            await prisma.healthDeviceConnection.update({
                where: {
                    patientId_provider: {
                        patientId,
                        provider: 'GOOGLE',
                    },
                },
                data: {
                    lastSync: new Date(),
                },
            });

            return { success: true, count: metrics.length };
        } catch (error) {
            console.error('[Google Fit Sync Error]', error);
            throw error;
        }
    }

    // Helper parsers
    private parseStepsData(data: any) {
        const metrics: any[] = [];
        data.bucket?.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any) => {
                dataset.point?.forEach((point: any) => {
                    const value = point.value?.[0]?.intVal || 0;
                    if (value > 0) {
                        metrics.push({
                            type: 'STEPS',
                            value,
                            unit: 'pasos',
                            recordedAt: new Date(parseInt(point.startTimeNanos) / 1000000),
                        });
                    }
                });
            });
        });
        return metrics;
    }

    private parseHeartRateData(data: any) {
        const metrics: any[] = [];
        data.bucket?.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any) => {
                dataset.point?.forEach((point: any) => {
                    const value = point.value?.[0]?.fpVal || 0;
                    if (value > 0) {
                        metrics.push({
                            type: 'HEART_RATE',
                            value: Math.round(value),
                            unit: 'bpm',
                            recordedAt: new Date(parseInt(point.startTimeNanos) / 1000000),
                        });
                    }
                });
            });
        });
        return metrics;
    }

    private parseSleepData(data: any) {
        const metrics: any[] = [];
        data.bucket?.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any) => {
                dataset.point?.forEach((point: any) => {
                    const startTime = parseInt(point.startTimeNanos) / 1000000;
                    const endTime = parseInt(point.endTimeNanos) / 1000000;
                    const hours = (endTime - startTime) / (1000 * 60 * 60);

                    if (hours > 0) {
                        metrics.push({
                            type: 'SLEEP',
                            value: parseFloat(hours.toFixed(2)),
                            unit: 'horas',
                            recordedAt: new Date(startTime),
                        });
                    }
                });
            });
        });
        return metrics;
    }
}
