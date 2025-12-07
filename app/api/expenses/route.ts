import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';

// GET - List expenses
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
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const deductibleOnly = searchParams.get('deductibleOnly') === 'true';

        const where: any = {};
        if (category) where.category = category;
        if (deductibleOnly) where.isDeductible = true;
        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate) where.paidAt.gte = new Date(startDate);
            if (endDate) where.paidAt.lte = new Date(endDate);
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: {
                paidAt: 'desc',
            },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error('[List Expenses Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create expense
export async function POST(request: Request) {
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
        const {
            description,
            category,
            amount,
            isDeductible,
            hasInvoice,
            supplierRut,
            supplierName,
            invoiceNumber,
            paymentMethod,
            paidAt,
            receiptUrl,
            notes,
        } = body;

        if (!description || !category || !amount || !paymentMethod || !paidAt) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                category,
                amount: parseFloat(amount),
                isDeductible: isDeductible !== false,
                hasInvoice: hasInvoice || false,
                supplierRut,
                supplierName,
                invoiceNumber,
                paymentMethod,
                paidAt: new Date(paidAt),
                receiptUrl,
                notes,
            },
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'CREATE',
            resource: 'EXPENSE',
            resourceId: expense.id,
            details: {
                description,
                category,
                amount,
            },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error: any) {
        console.error('[Create Expense Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update expense
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
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        if (updateData.amount) {
            updateData.amount = parseFloat(updateData.amount);
        }

        if (updateData.paidAt) {
            updateData.paidAt = new Date(updateData.paidAt);
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: updateData,
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'UPDATE',
            resource: 'EXPENSE',
            resourceId: expense.id,
            details: { description: expense.description },
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json(expense);
    } catch (error: any) {
        console.error('[Update Expense Error]', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete expense
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

        await prisma.expense.delete({
            where: { id },
        });

        // Audit log
        await createAuditLog({
            userId: session.user.id as string,
            action: 'DELETE',
            resource: 'EXPENSE',
            resourceId: id,
            details: {},
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Delete Expense Error]', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
