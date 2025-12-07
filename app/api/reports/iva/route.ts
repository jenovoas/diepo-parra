import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

/**
 * Generate IVA Report
 */
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
        const month = searchParams.get('month'); // YYYY-MM
        const format = searchParams.get('format') || 'json'; // json, excel

        if (!month) {
            return NextResponse.json({ error: 'Month is required' }, { status: 400 });
        }

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        // Get sales (invoices)
        const invoices = await prisma.invoice.findMany({
            where: {
                issuedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                paymentStatus: 'PAID',
            },
            include: {
                items: true,
            },
            orderBy: {
                issuedAt: 'asc',
            },
        });

        // Get purchases (expenses with invoice)
        const expenses = await prisma.expense.findMany({
            where: {
                paidAt: {
                    gte: startDate,
                    lte: endDate,
                },
                hasInvoice: true,
                isDeductible: true,
            },
            orderBy: {
                paidAt: 'asc',
            },
        });

        // Calculate IVA
        const debitoFiscal = invoices.reduce((sum, inv) => sum + inv.tax, 0); // IVA ventas
        const creditoFiscal = expenses.reduce((sum, exp) => {
            // Assuming expenses include IVA, calculate it
            const neto = Math.round(exp.amount / 1.19);
            const iva = exp.amount - neto;
            return sum + iva;
        }, 0); // IVA compras

        const ivaNeto = debitoFiscal - creditoFiscal;

        const report = {
            period: month,
            sales: {
                count: invoices.length,
                neto: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
                iva: debitoFiscal,
                total: invoices.reduce((sum, inv) => sum + inv.total, 0),
                invoices: invoices.map(inv => ({
                    number: inv.invoiceNumber,
                    type: inv.invoiceType,
                    date: inv.issuedAt,
                    client: inv.clientName,
                    neto: inv.subtotal,
                    iva: inv.tax,
                    total: inv.total,
                })),
            },
            purchases: {
                count: expenses.length,
                total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
                iva: creditoFiscal,
                expenses: expenses.map(exp => {
                    const neto = Math.round(exp.amount / 1.19);
                    const iva = exp.amount - neto;
                    return {
                        date: exp.paidAt,
                        supplier: exp.supplierName,
                        rut: exp.supplierRut,
                        invoice: exp.invoiceNumber,
                        neto,
                        iva,
                        total: exp.amount,
                    };
                }),
            },
            summary: {
                debitoFiscal,
                creditoFiscal,
                ivaNeto,
                status: ivaNeto > 0 ? 'A PAGAR' : 'A FAVOR',
            },
        };

        if (format === 'excel') {
            // Create Excel workbook
            const wb = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                ['REPORTE DE IVA'],
                ['Período', month],
                [''],
                ['VENTAS'],
                ['Neto', report.sales.neto],
                ['IVA (Débito Fiscal)', report.sales.iva],
                ['Total', report.sales.total],
                [''],
                ['COMPRAS'],
                ['Total', report.purchases.total],
                ['IVA (Crédito Fiscal)', report.purchases.iva],
                [''],
                ['RESUMEN'],
                ['Débito Fiscal (IVA Ventas)', report.summary.debitoFiscal],
                ['Crédito Fiscal (IVA Compras)', report.summary.creditoFiscal],
                ['IVA Neto', report.summary.ivaNeto],
                ['Estado', report.summary.status],
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

            // Sales sheet
            const salesData = [
                ['Número', 'Tipo', 'Fecha', 'Cliente', 'Neto', 'IVA', 'Total'],
                ...report.sales.invoices.map(inv => [
                    inv.number,
                    inv.type,
                    new Date(inv.date).toLocaleDateString('es-CL'),
                    inv.client,
                    inv.neto,
                    inv.iva,
                    inv.total,
                ]),
            ];
            const wsSales = XLSX.utils.aoa_to_sheet(salesData);
            XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas');

            // Purchases sheet
            const purchasesData = [
                ['Fecha', 'Proveedor', 'RUT', 'Factura', 'Neto', 'IVA', 'Total'],
                ...report.purchases.expenses.map(exp => [
                    new Date(exp.date).toLocaleDateString('es-CL'),
                    exp.supplier,
                    exp.rut,
                    exp.invoice,
                    exp.neto,
                    exp.iva,
                    exp.total,
                ]),
            ];
            const wsPurchases = XLSX.utils.aoa_to_sheet(purchasesData);
            XLSX.utils.book_append_sheet(wb, wsPurchases, 'Compras');

            // Generate buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="reporte-iva-${month}.xlsx"`,
                },
            });
        }

        return NextResponse.json(report);

    } catch (error) {
        console.error('[IVA Report Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
