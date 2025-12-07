"use client";

import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { formatCLP } from "@/lib/utils/tax-calculator";

interface ChartData {
    monthly: Array<{
        month: string;
        income: number;
        expenses: number;
        profit: number;
    }>;
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
}

const COLORS = {
    income: '#10b981',
    expenses: '#ef4444',
    profit: '#3b82f6',
    pending: '#eab308',
    partial: '#3b82f6',
    paid: '#10b981',
    overdue: '#ef4444',
};

const CATEGORY_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#6366f1',
];

export function FinancialCharts({ data }: { data: ChartData }) {
    // Format month labels
    const monthlyData = data.monthly.map(item => ({
        ...item,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('es-CL', {
            month: 'short',
            year: '2-digit',
        }),
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {formatCLP(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">{formatCLP(data.value)}</p>
                    {data.count && <p className="text-xs text-gray-500">{data.count} facturas</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Monthly Trend Line Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Tendencia Mensual</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis
                            dataKey="monthLabel"
                            className="text-xs"
                            stroke="#9ca3af"
                        />
                        <YAxis
                            className="text-xs"
                            stroke="#9ca3af"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Ingresos"
                            stroke={COLORS.income}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            name="Gastos"
                            stroke={COLORS.expenses}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            name="Utilidad"
                            stroke={COLORS.profit}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Income vs Expenses Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Ingresos vs Gastos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="monthLabel"
                                className="text-xs"
                                stroke="#9ca3af"
                            />
                            <YAxis
                                className="text-xs"
                                stroke="#9ca3af"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="income" name="Ingresos" fill={COLORS.income} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Gastos" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Status Pie Chart */}
                {data.paymentStatus.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Estado de Facturas</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.paymentStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.paymentStatus.map((entry, index) => {
                                        const colorKey = entry.name.toLowerCase().replace(' ', '') as keyof typeof COLORS;
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[colorKey] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Expenses by Category */}
            {data.expensesByCategory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.expensesByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                type="number"
                                className="text-xs"
                                stroke="#9ca3af"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                type="category"
                                dataKey="category"
                                className="text-xs"
                                stroke="#9ca3af"
                                width={120}
                            />
                            <Tooltip
                                formatter={(value: any) => formatCLP(value)}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="amount" name="Monto" radius={[0, 4, 4, 0]}>
                                {data.expensesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
