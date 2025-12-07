"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Receipt, Calendar } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";

interface AccountData {
    totalBilled: number;
    totalPaid: number;
    totalPending: number;
    invoiceCount: number;
    lastPayment: {
        amount: number;
        date: Date;
    } | null;
}

export function AccountStatement() {
    const [data, setData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAccountData();
    }, []);

    const loadAccountData = async () => {
        try {
            const res = await fetch('/api/patient/invoices');
            const invoices = await res.json();

            const totalBilled = invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
            const totalPaid = invoices.reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
            const totalPending = totalBilled - totalPaid;

            const allPayments = invoices.flatMap((inv: any) => inv.payments);
            const lastPayment = allPayments.length > 0
                ? allPayments.sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0]
                : null;

            setData({
                totalBilled,
                totalPaid,
                totalPending,
                invoiceCount: invoices.length,
                lastPayment: lastPayment ? { amount: lastPayment.amount, date: lastPayment.paidAt } : null,
            });
        } catch (error) {
            console.error('Error loading account data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando estado de cuenta...</div>;
    }

    if (!data) {
        return <div className="text-center py-8 text-red-500">Error al cargar datos</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Estado de Cuenta</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Billed */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Facturado</span>
                        <Receipt className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold">{formatCLP(data.totalBilled)}</p>
                    <p className="text-xs text-gray-500 mt-1">{data.invoiceCount} facturas</p>
                </div>

                {/* Total Paid */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700 dark:text-green-400">Total Pagado</span>
                        <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCLP(data.totalPaid)}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        {data.totalBilled > 0 ? Math.round((data.totalPaid / data.totalBilled) * 100) : 0}% del total
                    </p>
                </div>

                {/* Total Pending */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-yellow-700 dark:text-yellow-400">Saldo Pendiente</span>
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{formatCLP(data.totalPending)}</p>
                    {data.totalPending > 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Por pagar</p>
                    )}
                </div>

                {/* Last Payment */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-700 dark:text-blue-400">Último Pago</span>
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    {data.lastPayment ? (
                        <>
                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                {formatCLP(data.lastPayment.amount)}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                                {new Date(data.lastPayment.date).toLocaleDateString('es-CL')}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Sin pagos</p>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Resumen</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Estado de cuenta:</span>
                        <span className={data.totalPending > 0 ? "text-yellow-600 font-semibold" : "text-green-600 font-semibold"}>
                            {data.totalPending > 0 ? 'Con saldo pendiente' : 'Al día'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Porcentaje pagado:</span>
                        <span className="font-semibold">
                            {data.totalBilled > 0 ? Math.round((data.totalPaid / data.totalBilled) * 100) : 0}%
                        </span>
                    </div>
                    {data.totalPending > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                💡 Tienes un saldo pendiente de <strong>{formatCLP(data.totalPending)}</strong>.
                                Revisa tus facturas para ver los detalles.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
