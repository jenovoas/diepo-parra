import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSignature } from '@/lib/utils/signature';
import { getIpAddress, getUserAgent } from '@/lib/utils/audit';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { signatureData, documentType, documentId, documentContent } = await request.json();

        if (!signatureData || !documentType || !documentId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify user is a professional (ADMIN or DOCTOR)
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && userRole !== 'DOCTOR') {
            return NextResponse.json(
                { error: 'Only medical professionals can sign documents' },
                { status: 403 }
            );
        }

        const signature = await createSignature({
            userId: session.user.id as string,
            signatureData,
            documentType,
            documentId,
            documentContent,
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json({
            success: true,
            signatureId: signature.id,
            signedAt: signature.signedAt,
        });
    } catch (error: any) {
        console.error('[Create Signature Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const documentType = searchParams.get('documentType');
        const documentId = searchParams.get('documentId');

        if (!documentType || !documentId) {
            return NextResponse.json(
                { error: 'Missing documentType or documentId' },
                { status: 400 }
            );
        }

        const { getSignature } = await import('@/lib/utils/signature');
        const signature = await getSignature(documentType, documentId);

        if (!signature) {
            return NextResponse.json({ signed: false });
        }

        return NextResponse.json({
            signed: true,
            signature: {
                id: signature.id,
                signedAt: signature.signedAt,
                professional: signature.user,
            },
        });
    } catch (error: any) {
        console.error('[Get Signature Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
