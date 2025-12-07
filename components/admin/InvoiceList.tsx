"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FileText, Search, Filter, Eye, DollarSign, Mail, Download } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    clientName: string | null;
    total: number;
    paymentStatus: string;
    issuedAt: Date;
    dueDate: Date | null;
    patient: {
        fullName: string;
    } | null;
}

const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    PARTIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const STATUS_LABELS = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    PAID: 'Pagada',
    OVERDUE: 'Vencida',
    CANCELLED: 'Cancelada',
};

export function InvoiceList({ onSelectInvoice }: { onSelectInvoice?: (id: string) => void }) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        loadInvoices();
    }, [statusFilter]);

    const loadInvoices = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'ALL') params.append('paymentStatus', statusFilter);

            const res = await fetch(`/api/invoices?${params}`);
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'ALL' || inv.invoiceType === typeFilter;

        return matchesSearch && matchesType;
    });

    const stats = {
        total: invoices.reduce((sum, inv) => sum + inv.total, 0),
        pending: invoices.filter(i => i.paymentStatus === 'PENDING').reduce((sum, inv) => sum + inv.total, 0),
        paid: invoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
        overdue: invoices.filter(i => i.paymentStatus === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
    };

    if (loading) {
        return <div className="text-center py-8">Cargando facturas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Gestión de Facturas</h2>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
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
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-1">Vencido</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCLP(stats.overdue)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por número o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="PARTIAL">Parcial</option>
                        <option value="PAID">Pagada</option>
                        <option value="OVERDUE">Vencida</option>
                        <option value="CANCELLED">Cancelada</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="ALL">Todos los tipos</option>
                        <option value="BOLETA">Boleta</option>
                        <option value="FACTURA">Factura</option>
                    </select>
                </div>
            </div>

            {/* Invoice List */}
            <div className="space-y-3">
                {filteredInvoices.map((invoice) => (
                    <div
                        key={invoice.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        {invoice.invoiceType}
                                    </span>
                                    <span className={cn("text-xs px-2 py-1 rounded font-medium", STATUS_COLORS[invoice.paymentStatus as keyof typeof STATUS_COLORS])}>
                                        {STATUS_LABELS[invoice.paymentStatus as keyof typeof STATUS_LABELS]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Cliente: {invoice.clientName || invoice.patient?.fullName || 'N/A'}</span>
                                    <span>•</span>
                                    <span>Emitida: {new Date(invoice.issuedAt).toLocaleDateString('es-CL')}</span>
                                    {invoice.dueDate && (
                                        <>
                                            <span>•</span>
                                            <span>Vence: {new Date(invoice.dueDate).toLocaleDateString('es-CL')}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold font-mono">{formatCLP(invoice.total)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onSelectInvoice?.(invoice.id)}
                                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {invoice.paymentStatus !== 'PAID' && invoice.paymentStatus !== 'CANCELLED' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredInvoices.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No se encontraron facturas con los filtros seleccionados.
                </div>
            )}
        </div>
    );
}
