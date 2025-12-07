"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";

export function IVAReport() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/iva?month=${month}`);
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        window.open(`/api/reports/iva?month=${month}&format=excel`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Reporte de IVA</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Período</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <Button onClick={loadReport} disabled={loading} className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {loading ? 'Cargando...' : 'Generar Reporte'}
                    </Button>
                    {report && (
                        <Button onClick={downloadExcel} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Descargar Excel
                        </Button>
                    )}
                </div>
            </div>

            {report && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-400 mb-1">Débito Fiscal (Ventas)</p>
                            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                                {formatCLP(report.summary.debitoFiscal)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                {report.sales.count} facturas
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Crédito Fiscal (Compras)</p>
                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                {formatCLP(report.summary.creditoFiscal)}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                                {report.purchases.count} gastos
                            </p>
                        </div>

                        <div className={`p-6 rounded-lg border ${report.summary.ivaNeto > 0
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            }`}>
                            <p className={`text-sm mb-1 ${report.summary.ivaNeto > 0
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-green-700 dark:text-green-400'
                                }`}>
                                IVA Neto
                            </p>
                            <p className={`text-3xl font-bold ${report.summary.ivaNeto > 0
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-green-700 dark:text-green-400'
                                }`}>
                                {formatCLP(Math.abs(report.summary.ivaNeto))}
                            </p>
                            <p className={`text-xs mt-1 font-semibold ${report.summary.ivaNeto > 0
                                    ? 'text-red-600 dark:text-red-500'
                                    : 'text-green-600 dark:text-green-500'
                                }`}>
                                {report.summary.status}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sales */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold mb-4">Ventas ({report.sales.count})</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>Neto:</span>
                                    <span className="font-mono">{formatCLP(report.sales.neto)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>IVA:</span>
                                    <span className="font-mono">+ {formatCLP(report.sales.iva)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatCLP(report.sales.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Purchases */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold mb-4">Compras ({report.purchases.count})</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatCLP(report.purchases.total)}</span>
                                </div>
                                <div className="flex justify-between text-blue-600">
                                    <span>IVA Recuperable:</span>
                                    <span className="font-mono">{formatCLP(report.purchases.iva)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
