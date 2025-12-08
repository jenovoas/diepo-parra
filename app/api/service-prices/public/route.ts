import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get service prices for public display
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        if (serviceId) {
            // Get specific service price
            const servicePrice = await prisma.servicePrice.findFirst({
                where: {
                    OR: [
                        { id: serviceId },
                        { name: { contains: serviceId } },
                    ],
                    isActive: true,
                },
            });

            if (!servicePrice) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            return NextResponse.json({
                id: servicePrice.id,
                name: servicePrice.name,
                description: servicePrice.description,
                basePrice: servicePrice.basePrice,
                tax: servicePrice.taxAmount,
                finalPrice: servicePrice.finalPrice,
            });
        }

        // Get all active service prices
        const servicePrices = await prisma.servicePrice.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(servicePrices.map(sp => ({
            id: sp.id,
            name: sp.name,
            description: sp.description,
            basePrice: sp.basePrice,
            tax: sp.taxAmount,
            finalPrice: sp.finalPrice,
        })));

    } catch (error) {
        console.error('[Service Prices Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
