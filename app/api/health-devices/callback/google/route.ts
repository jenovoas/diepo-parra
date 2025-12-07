import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleFitClient } from '@/lib/integrations/google-fit';
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
                `${process.env.NEXTAUTH_URL}/dashboard?error=google_fit_denied`
            );
        }

        if (!code || !state) {
            return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
        }

        const googleFit = new GoogleFitClient();

        // Exchange code for tokens
        const tokens = await googleFit.getTokensFromCode(code);

        // Save connection
        await googleFit.saveConnection(state, tokens);

        // Create audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'HEALTH_DEVICE',
            resourceId: state,
            patientId: state,
            details: { provider: 'GOOGLE_FIT' },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        // Redirect back to dashboard
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard?success=google_fit_connected`
        );
    } catch (error) {
        console.error('[Google Fit Callback Error]', error);
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard?error=google_fit_failed`
        );
    }
}
