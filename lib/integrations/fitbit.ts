import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/utils/encryption';

/**
 * Fitbit Integration
 * Docs: https://dev.fitbit.com/build/reference/web-api/
 */

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_API_URL = 'https://api.fitbit.com/1/user/-';

const SCOPES = [
    'activity',
    'heartrate',
    'sleep',
    'weight',
    'profile',
];

export class FitbitClient {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.FITBIT_CLIENT_ID || '';
        this.clientSecret = process.env.FITBIT_CLIENT_SECRET || '';
        this.redirectUri = `${process.env.NEXTAUTH_URL}/api/health-devices/callback/fitbit`;
    }

    /**
     * Get authorization URL for OAuth flow
     */
    getAuthUrl(patientId: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            scope: SCOPES.join(' '),
            redirect_uri: this.redirectUri,
            state: patientId,
        });

        return `${FITBIT_AUTH_URL}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokensFromCode(code: string) {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(FITBIT_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        return await response.json();
    }

    /**
     * Save connection to database
     */
    async saveConnection(patientId: string, tokens: any) {
        const encryptedAccessToken = encrypt(tokens.access_token);
        const encryptedRefreshToken = encrypt(tokens.refresh_token);
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        await prisma.healthDeviceConnection.upsert({
            where: {
                patientId_provider: {
                    patientId,
                    provider: 'FITBIT',
                },
            },
            create: {
                patientId,
                provider: 'FITBIT',
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt,
                isActive: true,
            },
            update: {
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt,
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
                    provider: 'FITBIT',
                },
            },
        });
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(connection: any) {
        const refreshToken = decrypt(connection.refreshToken || '');
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(FITBIT_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        await prisma.healthDeviceConnection.update({
            where: { id: connection.id },
            data: {
                accessToken: encrypt(tokens.access_token),
                refreshToken: encrypt(tokens.refresh_token),
                expiresAt,
            },
        });

        return tokens.access_token;
    }

    /**
     * Get valid access token
     */
    async getValidAccessToken(patientId: string): Promise<string> {
        const connection = await this.getConnection(patientId);

        if (!connection) {
            throw new Error('No Fitbit connection found');
        }

        const now = new Date();
        if (connection.expiresAt && connection.expiresAt <= now) {
            return await this.refreshAccessToken(connection);
        }

        return decrypt(connection.accessToken || '');
    }

    /**
     * Fetch activity data (steps)
     */
    async fetchSteps(patientId: string, date: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        const dateStr = date.toISOString().split('T')[0];

        const response = await fetch(
            `${FITBIT_API_URL}/activities/steps/date/${dateStr}/7d.json`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch steps');
        }

        const data = await response.json();
        return this.parseStepsData(data);
    }

    /**
     * Fetch heart rate data
     */
    async fetchHeartRate(patientId: string, date: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        const dateStr = date.toISOString().split('T')[0];

        const response = await fetch(
            `${FITBIT_API_URL}/activities/heart/date/${dateStr}/7d.json`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch heart rate');
        }

        const data = await response.json();
        return this.parseHeartRateData(data);
    }

    /**
     * Fetch sleep data
     */
    async fetchSleep(patientId: string, date: Date) {
        const accessToken = await this.getValidAccessToken(patientId);
        const dateStr = date.toISOString().split('T')[0];

        const response = await fetch(
            `${FITBIT_API_URL}/sleep/date/${dateStr}.json`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sleep');
        }

        const data = await response.json();
        return this.parseSleepData(data);
    }

    /**
     * Sync all metrics
     */
    async syncAllMetrics(patientId: string) {
        const today = new Date();

        try {
            const [steps, heartRate, sleep] = await Promise.all([
                this.fetchSteps(patientId, today),
                this.fetchHeartRate(patientId, today),
                this.fetchSleep(patientId, today),
            ]);

            const metrics = [...steps, ...heartRate, ...sleep];

            for (const metric of metrics) {
                await prisma.healthMetric.create({
                    data: {
                        patientId,
                        type: metric.type,
                        value: metric.value,
                        unit: metric.unit,
                        source: 'FITBIT',
                        recordedAt: metric.recordedAt,
                    },
                });
            }

            await prisma.healthDeviceConnection.update({
                where: {
                    patientId_provider: {
                        patientId,
                        provider: 'FITBIT',
                    },
                },
                data: {
                    lastSync: new Date(),
                },
            });

            return { success: true, count: metrics.length };
        } catch (error) {
            console.error('[Fitbit Sync Error]', error);
            throw error;
        }
    }

    // Parsers
    private parseStepsData(data: any) {
        const metrics: any[] = [];
        data['activities-steps']?.forEach((day: any) => {
            if (day.value && parseInt(day.value) > 0) {
                metrics.push({
                    type: 'STEPS',
                    value: parseInt(day.value),
                    unit: 'pasos',
                    recordedAt: new Date(day.dateTime),
                });
            }
        });
        return metrics;
    }

    private parseHeartRateData(data: any) {
        const metrics: any[] = [];
        data['activities-heart']?.forEach((day: any) => {
            const restingHR = day.value?.restingHeartRate;
            if (restingHR) {
                metrics.push({
                    type: 'HEART_RATE',
                    value: restingHR,
                    unit: 'bpm',
                    recordedAt: new Date(day.dateTime),
                });
            }
        });
        return metrics;
    }

    private parseSleepData(data: any) {
        const metrics: any[] = [];
        data.sleep?.forEach((sleep: any) => {
            const hours = sleep.duration / (1000 * 60 * 60);
            if (hours > 0) {
                metrics.push({
                    type: 'SLEEP',
                    value: parseFloat(hours.toFixed(2)),
                    unit: 'horas',
                    recordedAt: new Date(sleep.dateOfSleep),
                });
            }
        });
        return metrics;
    }
}
