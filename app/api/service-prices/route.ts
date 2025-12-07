import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateServicePrice } from '@/lib/utils/tax-calculator';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

// GET - List all service prices
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const category = searchParams.get('category');

        const where: any = {};
        if (activeOnly) where.isActive = true;
        if (category) where.category = category;

        const prices = await prisma.servicePrice.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json(prices);
    } catch (error) {
        console.error('[Get Prices Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new service price
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can create prices
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, category, basePrice, durationMinutes } = body;

        if (!name || !basePrice) {
            return NextResponse.json(
                { error: 'Name and basePrice are required' },
                { status: 400 }
            );
        }

        // Calculate tax
        const pricing = calculateServicePrice(basePrice);

        const servicePrice = await prisma.servicePrice.create({
            data: {
                name,
                description,
                category,
                basePrice: pricing.basePrice,
                taxRate: pricing.taxRate,
                taxAmount: pricing.taxAmount,
                finalPrice: pricing.finalPrice,
                durationMinutes,
                isActive: true,
            },
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'SERVICE_PRICE',
            resourceId: servicePrice.id,
            details: { name, basePrice, finalPrice: pricing.finalPrice },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(servicePrice, { status: 201 });
    } catch (error: any) {
        console.error('[Create Price Error]', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A service with this name already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update service price
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, description, category, basePrice, durationMinutes, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Recalculate tax if basePrice changed
        const updateData: any = {
            name,
            description,
            category,
            durationMinutes,
            isActive,
        };

        if (basePrice !== undefined) {
            const pricing = calculateServicePrice(basePrice);
            updateData.basePrice = pricing.basePrice;
            updateData.taxRate = pricing.taxRate;
            updateData.taxAmount = pricing.taxAmount;
            updateData.finalPrice = pricing.finalPrice;
        }

        const servicePrice = await prisma.servicePrice.update({
            where: { id },
            data: updateData,
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'UPDATE',
            resource: 'SERVICE_PRICE',
            resourceId: servicePrice.id,
            details: { name, basePrice, finalPrice: servicePrice.finalPrice },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(servicePrice);
    } catch (error: any) {
        console.error('[Update Price Error]', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Service price not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete service price
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Soft delete - just mark as inactive
        const servicePrice = await prisma.servicePrice.update({
            where: { id },
            data: { isActive: false },
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'DELETE',
            resource: 'SERVICE_PRICE',
            resourceId: servicePrice.id,
            details: { name: servicePrice.name },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Delete Price Error]', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Service price not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
