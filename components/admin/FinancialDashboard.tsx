"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Receipt, FileText, AlertCircle } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";
import { FinancialCharts } from "./FinancialCharts";

interface DashboardData {
    income: {
        total: number;
        paid: number;
        pending: number;
        overdue: number;
        count: number;
    };
    expenses: {
        total: number;
        deductible: number;
        count: number;
    };
    profitLoss: {
        profit: number;
        profitMargin: number;
        netIncome: number;
        totalExpenses: number;
    };
    monthly: Array<{
        month: string;
        income: number;
        expenses: number;
        profit: number;
    }>;
    charts?: {
        paymentStatus: Array<{
            name: string;
            value: number;
            count: number;
        }>;
        expensesByCategory: Array<{
            category: string;
            amount: number;
            percentage: number;
        }>;
    };
}

export function FinancialDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        loadDashboard();
    }, [period]);

    const loadDashboard = async () => {
        try {
            const now = new Date();
            let startDate: Date | undefined;

            if (period === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (period === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
            }

            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate.toISOString());
            params.append('endDate', now.toISOString());

            const res = await fetch(`/api/accounting/dashboard?${params}`);
            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando dashboard...</div>;
    }

    if (!data) {
        return <div className="text-center py-8 text-red-500">Error al cargar datos</div>;
    }

    const isProfit = data.profitLoss.profit >= 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">Dashboard Financiero</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="month">Este Mes</option>
                    <option value="year">Este Año</option>
                    <option value="all">Todo el Tiempo</option>
                </select>
            </div>

            {/* Main Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                {/* Income */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Ingresos Cobrados</span>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCLP(data.income.paid)}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">{data.income.count} facturas</p>
                </div>

                {/* Expenses */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">Gastos Totales</span>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-400">{formatCLP(data.expenses.total)}</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">{data.expenses.count} registros</p>
                </div>

                {/* Profit/Loss */}
                <div className={cn(
                    "p-6 rounded-lg border",
                    isProfit
                        ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
                        : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                            "text-sm font-medium",
                            isProfit ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"
                        )}>
                            {isProfit ? 'Utilidad' : 'Pérdida'}
                        </span>
                        <DollarSign className={cn("w-5 h-5", isProfit ? "text-blue-600" : "text-orange-600")} />
                    </div>
                    <p className={cn(
                        "text-3xl font-bold",
                        isProfit ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"
                    )}>
                        {formatCLP(Math.abs(data.profitLoss.profit))}
                    </p>
                    <p className={cn(
                        "text-xs mt-1",
                        isProfit ? "text-blue-600 dark:text-blue-500" : "text-orange-600 dark:text-orange-500"
                    )}>
                        Margen: {data.profitLoss.profitMargin.toFixed(1)}%
                    </p>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Por Cobrar</span>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{formatCLP(data.income.pending)}</p>
                    {data.income.overdue > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                            Vencido: {formatCLP(data.income.overdue)}
                        </p>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Income vs Expenses */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Resumen Financiero
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Ingresos Totales</span>
                                <span className="font-mono font-semibold">{formatCLP(data.income.total)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Gastos Totales</span>
                                <span className="font-mono font-semibold">{formatCLP(data.expenses.total)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{
                                        width: `${data.income.total > 0 ? (data.expenses.total / data.income.total) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Resultado Neto</span>
                                <span className={cn(
                                    "text-2xl font-bold font-mono",
                                    isProfit ? "text-green-600" : "text-red-600"
                                )}>
                                    {isProfit ? '+' : '-'} {formatCLP(Math.abs(data.profitLoss.profit))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deductible Expenses */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Gastos Deducibles
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Gastos Deducibles</span>
                                <span className="font-mono font-semibold text-green-600">
                                    {formatCLP(data.expenses.deductible)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                        width: `${data.expenses.total > 0 ? (data.expenses.deductible / data.expenses.total) * 100 : 0}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {data.expenses.total > 0 ? Math.round((data.expenses.deductible / data.expenses.total) * 100) : 0}% del total
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Gastos No Deducibles</span>
                                <span className="font-mono font-semibold text-gray-600">
                                    {formatCLP(data.expenses.total - data.expenses.deductible)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gray-400 h-2 rounded-full"
                                    style={{
                                        width: `${data.expenses.total > 0 ? ((data.expenses.total - data.expenses.deductible) / data.expenses.total) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-xs text-blue-900 dark:text-blue-300">
                                    <strong>Ahorro Fiscal Estimado:</strong> Los gastos deducibles pueden reducir tu base imponible.
                                    Consulta con tu contador para el cálculo exacto.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            {data.monthly.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Tendencia Mensual</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-2">Mes</th>
                                    <th className="text-right py-2">Ingresos</th>
                                    <th className="text-right py-2">Gastos</th>
                                    <th className="text-right py-2">Utilidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.monthly.map((month) => (
                                    <tr key={month.month} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="py-2">{new Date(month.month + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</td>
                                        <td className="text-right font-mono text-green-600">{formatCLP(month.income)}</td>
                                        <td className="text-right font-mono text-red-600">{formatCLP(month.expenses)}</td>
                                        <td className={cn(
                                            "text-right font-mono font-semibold",
                                            month.profit >= 0 ? "text-blue-600" : "text-orange-600"
                                        )}>
                                            {month.profit >= 0 ? '+' : '-'} {formatCLP(Math.abs(month.profit))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {data.charts && (
                <FinancialCharts
                    data={{
                        monthly: data.monthly,
                        paymentStatus: data.charts.paymentStatus,
                        expensesByCategory: data.charts.expensesByCategory,
                    }}
                />
            )}
        </div>
    );
}
