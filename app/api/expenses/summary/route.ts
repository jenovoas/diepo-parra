import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {};
        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate) where.paidAt.gte = new Date(startDate);
            if (endDate) where.paidAt.lte = new Date(endDate);
        }

        // Total by category
        const byCategory = await prisma.expense.groupBy({
            by: ['category'],
            where,
            _sum: {
                amount: true,
            },
            _count: true,
        });

        // Deductible vs non-deductible
        const deductible = await prisma.expense.aggregate({
            where: { ...where, isDeductible: true },
            _sum: { amount: true },
            _count: true,
        });

        const nonDeductible = await prisma.expense.aggregate({
            where: { ...where, isDeductible: false },
            _sum: { amount: true },
            _count: true,
        });

        // Total expenses
        const total = await prisma.expense.aggregate({
            where,
            _sum: { amount: true },
            _count: true,
        });

        return NextResponse.json({
            total: {
                amount: total._sum.amount || 0,
                count: total._count,
            },
            deductible: {
                amount: deductible._sum.amount || 0,
                count: deductible._count,
            },
            nonDeductible: {
                amount: nonDeductible._sum.amount || 0,
                count: nonDeductible._count,
            },
            byCategory: byCategory.map(cat => ({
                category: cat.category,
                amount: cat._sum.amount || 0,
                count: cat._count,
            })),
        });
    } catch (error) {
        console.error('[Expense Summary Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
