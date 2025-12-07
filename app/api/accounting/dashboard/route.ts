import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getInvoiceStats } from '@/lib/services/invoice-service';

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

        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        // Get invoice stats
        const invoiceStats = await getInvoiceStats(start, end);

        // Get expense stats
        const expenseWhere: any = {};
        if (start || end) {
            expenseWhere.paidAt = {};
            if (start) expenseWhere.paidAt.gte = start;
            if (end) expenseWhere.paidAt.lte = end;
        }

        const expenseStats = await prisma.expense.aggregate({
            where: expenseWhere,
            _sum: { amount: true },
            _count: true,
        });

        const deductibleExpenses = await prisma.expense.aggregate({
            where: { ...expenseWhere, isDeductible: true },
            _sum: { amount: true },
        });

        // Calculate profit/loss
        const totalIncome = invoiceStats.paid.amount;
        const totalExpenses = expenseStats._sum.amount || 0;
        const profit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

        // Get monthly breakdown
        const monthlyData = await getMonthlyBreakdown(start, end);

        // Get payment status distribution
        const paymentStatusData = await prisma.invoice.groupBy({
            by: ['paymentStatus'],
            where: {
                issuedAt: {
                    gte: start || new Date(new Date().getFullYear(), 0, 1),
                    lte: end || new Date(),
                },
            },
            _sum: {
                total: true,
            },
            _count: true,
        });

        // Get expenses by category
        const expensesByCategory = await prisma.expense.groupBy({
            by: ['category'],
            where: expenseWhere,
            _sum: {
                amount: true,
            },
        });

        const totalExpensesForPercentage = expensesByCategory.reduce(
            (sum, cat) => sum + (cat._sum.amount || 0),
            0
        );

        return NextResponse.json({
            income: {
                total: invoiceStats.total.amount,
                paid: invoiceStats.paid.amount,
                pending: invoiceStats.pending.amount,
                overdue: invoiceStats.overdue.amount,
                count: invoiceStats.total.count,
            },
            expenses: {
                total: totalExpenses,
                deductible: deductibleExpenses._sum.amount || 0,
                count: expenseStats._count,
            },
            profitLoss: {
                profit,
                profitMargin,
                netIncome: totalIncome,
                totalExpenses,
            },
            monthly: monthlyData,
            charts: {
                paymentStatus: paymentStatusData.map(item => ({
                    name: item.paymentStatus === 'PAID' ? 'Pagada' :
                        item.paymentStatus === 'PENDING' ? 'Pendiente' :
                            item.paymentStatus === 'PARTIAL' ? 'Parcial' :
                                item.paymentStatus === 'OVERDUE' ? 'Vencida' : item.paymentStatus,
                    value: item._sum.total || 0,
                    count: item._count,
                })),
                expensesByCategory: expensesByCategory.map(cat => ({
                    category: cat.category === 'SUPPLIES' ? 'Insumos' :
                        cat.category === 'RENT' ? 'Arriendo' :
                            cat.category === 'UTILITIES' ? 'Servicios' :
                                cat.category === 'SALARIES' ? 'Sueldos' :
                                    cat.category === 'EQUIPMENT' ? 'Equipamiento' :
                                        cat.category === 'MARKETING' ? 'Marketing' : 'Otros',
                    amount: cat._sum.amount || 0,
                    percentage: totalExpensesForPercentage > 0
                        ? ((cat._sum.amount || 0) / totalExpensesForPercentage) * 100
                        : 0,
                })),
            },
        });
    } catch (error) {
        console.error('[Financial Dashboard Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function getMonthlyBreakdown(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get invoices by month
    const invoices = await prisma.invoice.findMany({
        where: {
            issuedAt: {
                gte: start,
                lte: end,
            },
            paymentStatus: 'PAID',
        },
        select: {
            total: true,
            issuedAt: true,
        },
    });

    // Get expenses by month
    const expenses = await prisma.expense.findMany({
        where: {
            paidAt: {
                gte: start,
                lte: end,
            },
        },
        select: {
            amount: true,
            paidAt: true,
        },
    });

    // Group by month
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    invoices.forEach(inv => {
        const month = inv.issuedAt.toISOString().slice(0, 7); // YYYY-MM
        const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
        current.income += inv.total;
        monthlyMap.set(month, current);
    });

    expenses.forEach(exp => {
        const month = exp.paidAt.toISOString().slice(0, 7);
        const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
        current.expenses += exp.amount;
        monthlyMap.set(month, current);
    });

    // Convert to array and sort
    return Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
            month,
            income: data.income,
            expenses: data.expenses,
            profit: data.income - data.expenses,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
}
