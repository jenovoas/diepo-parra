"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, DollarSign, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCLP } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    subtotal: number;
    tax: number;
    total: number;
    paidAmount: number;
    paymentStatus: string;
    issuedAt: Date;
    dueDate: Date | null;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    payments: Array<{
        amount: number;
        method: string;
        paidAt: Date;
    }>;
}

const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    PARTIAL: { label: 'Pago Parcial', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    PAID: { label: 'Pagada', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    OVERDUE: { label: 'Vencida', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export function MyInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        loadInvoices();
    }, [filter]);

    const loadInvoices = async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('status', filter);

            const res = await fetch(`/api/patient/invoices?${params}`);
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: invoices.reduce((sum, inv) => sum + inv.total, 0),
        paid: invoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
        pending: invoices.filter(i => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.paymentStatus)).reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0),
    };

    if (loading) {
        return <div className="text-center py-8">Cargando facturas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Mis Facturas</h2>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Facturado</p>
                    <p className="text-2xl font-bold">{formatCLP(stats.total)}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoices.length} facturas</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400 mb-1">Pagado</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCLP(stats.paid)}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">Pendiente</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{formatCLP(stats.pending)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                            filter === status
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        {status === 'ALL' ? 'Todas' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            <div className="space-y-3">
                {invoices.map((invoice) => {
                    const balance = invoice.total - invoice.paidAmount;
                    const statusConfig = STATUS_CONFIG[invoice.paymentStatus as keyof typeof STATUS_CONFIG];

                    return (
                        <div
                            key={invoice.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                                        <span className={cn("text-xs px-2 py-1 rounded font-medium", statusConfig?.color)}>
                                            {statusConfig?.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(invoice.issuedAt).toLocaleDateString('es-CL')}
                                        </span>
                                        {invoice.dueDate && (
                                            <span>Vence: {new Date(invoice.dueDate).toLocaleDateString('es-CL')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold font-mono">{formatCLP(invoice.total)}</p>
                                    {balance > 0 && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Saldo: {formatCLP(balance)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Servicios:</p>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    {invoice.items.slice(0, 2).map((item, idx) => (
                                        <li key={idx}>
                                            • {item.description} ({item.quantity}x {formatCLP(item.unitPrice)})
                                        </li>
                                    ))}
                                    {invoice.items.length > 2 && (
                                        <li className="text-gray-500">+ {invoice.items.length - 2} más...</li>
                                    )}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver Detalle
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {invoices.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No tienes facturas {filter !== 'ALL' && 'con este estado'}.
                </div>
            )}

            {/* Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{selectedInvoice.invoiceNumber}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>
                                ✕
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Items */}
                            <div>
                                <h4 className="font-semibold mb-2">Servicios</h4>
                                <div className="space-y-2">
                                    {selectedInvoice.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{item.description} (x{item.quantity})</span>
                                            <span className="font-mono">{formatCLP(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal (Neto):</span>
                                    <span className="font-mono">{formatCLP(selectedInvoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>IVA (19%):</span>
                                    <span className="font-mono">+ {formatCLP(selectedInvoice.tax)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                                    <span>TOTAL:</span>
                                    <span className="font-mono">{formatCLP(selectedInvoice.total)}</span>
                                </div>
                                {selectedInvoice.paidAmount > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm text-blue-600">
                                            <span>Pagado:</span>
                                            <span className="font-mono">- {formatCLP(selectedInvoice.paidAmount)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                                            <span>SALDO:</span>
                                            <span className="font-mono text-red-600">
                                                {formatCLP(selectedInvoice.total - selectedInvoice.paidAmount)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Payments */}
                            {selectedInvoice.payments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Pagos Realizados
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedInvoice.payments.map((payment, idx) => (
                                            <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                <span>{payment.method} • {new Date(payment.paidAt).toLocaleDateString('es-CL')}</span>
                                                <span className="font-mono font-semibold">{formatCLP(payment.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                            <Button className="w-full gap-2">
                                <Download className="w-4 h-4" />
                                Descargar Comprobante PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
