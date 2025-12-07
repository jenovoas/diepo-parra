import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FitbitClient } from '@/lib/integrations/fitbit';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // patient ID
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.redirect(
                `${process.env.NEXTAUTH_URL}/dashboard?error=fitbit_denied`
            );
        }

        if (!code || !state) {
            return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
        }

        const fitbit = new FitbitClient();

        // Exchange code for tokens
        const tokens = await fitbit.getTokensFromCode(code);

        // Save connection
        await fitbit.saveConnection(state, tokens);

        // Create audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'HEALTH_DEVICE',
            resourceId: state,
            patientId: state,
            details: { provider: 'FITBIT' },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard?success=fitbit_connected`
        );
    } catch (error) {
        console.error('[Fitbit Callback Error]', error);
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard?error=fitbit_failed`
        );
    }
}
