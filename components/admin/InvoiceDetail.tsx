"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { X, Download, Mail, DollarSign, FileText, User, Calendar, CreditCard } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";

interface InvoiceDetailProps {
    invoiceId: string;
    onClose: () => void;
    onPaymentAdded?: () => void;
}

interface InvoiceData {
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    clientName: string | null;
    clientRut: string | null;
    clientEmail: string | null;
    subtotal: number;
    tax: number;
    total: number;
    paidAmount: number;
    paymentStatus: string;
    issuedAt: Date;
    dueDate: Date | null;
    notes: string | null;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        subtotal: number;
    }>;
    payments: Array<{
        id: string;
        amount: number;
        method: string;
        paidAt: Date;
        reference: string | null;
    }>;
    patient: {
        fullName: string;
        phone: string | null;
        user: {
            email: string;
        } | null;
    } | null;
}

export function InvoiceDetail({ invoiceId, onClose, onPaymentAdded }: InvoiceDetailProps) {
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'TRANSFER',
        reference: '',
        notes: '',
    });

    useEffect(() => {
        loadInvoice();
    }, [invoiceId]);

    const loadInvoice = async () => {
        try {
            const res = await fetch(`/api/invoices/${invoiceId}`);
            const data = await res.json();
            setInvoice(data);
            setPaymentData(prev => ({ ...prev, amount: (data.total - data.paidAmount).toString() }));
        } catch (error) {
            console.error('Error loading invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...paymentData,
                    amount: parseFloat(paymentData.amount),
                }),
            });

            if (!res.ok) throw new Error('Error al registrar pago');

            alert('Pago registrado exitosamente');
            await loadInvoice();
            setShowPaymentForm(false);
            onPaymentAdded?.();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
                    <p>Cargando factura...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return null;
    }

    const balance = invoice.total - invoice.paidAmount;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div>
                            <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
                            <p className="text-sm text-gray-500">{invoice.invoiceType}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Client Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Información del Cliente
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Nombre:</span> {invoice.clientName || invoice.patient?.fullName}</p>
                                {invoice.clientRut && <p><span className="text-gray-500">RUT:</span> {invoice.clientRut}</p>}
                                {invoice.clientEmail && <p><span className="text-gray-500">Email:</span> {invoice.clientEmail}</p>}
                                {invoice.patient?.phone && <p><span className="text-gray-500">Teléfono:</span> {invoice.patient.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Fechas
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Emitida:</span> {new Date(invoice.issuedAt).toLocaleDateString('es-CL')}</p>
                                {invoice.dueDate && (
                                    <p><span className="text-gray-500">Vencimiento:</span> {new Date(invoice.dueDate).toLocaleDateString('es-CL')}</p>
                                )}
                                <p>
                                    <span className="text-gray-500">Estado:</span>{' '}
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-medium",
                                        invoice.paymentStatus === 'PAID' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                        invoice.paymentStatus === 'PENDING' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                                        invoice.paymentStatus === 'PARTIAL' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                        invoice.paymentStatus === 'OVERDUE' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    )}>
                                        {invoice.paymentStatus === 'PAID' && 'Pagada'}
                                        {invoice.paymentStatus === 'PENDING' && 'Pendiente'}
                                        {invoice.paymentStatus === 'PARTIAL' && 'Pago Parcial'}
                                        {invoice.paymentStatus === 'OVERDUE' && 'Vencida'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="font-semibold mb-3">Items</h3>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left p-3">Descripción</th>
                                        <th className="text-right p-3">Cantidad</th>
                                        <th className="text-right p-3">Precio Unit.</th>
                                        <th className="text-right p-3">Descuento</th>
                                        <th className="text-right p-3">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, idx) => (
                                        <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-3">{item.description}</td>
                                            <td className="text-right p-3 font-mono">{item.quantity}</td>
                                            <td className="text-right p-3 font-mono">{formatCLP(item.unitPrice)}</td>
                                            <td className="text-right p-3 font-mono">{item.discount > 0 ? formatCLP(item.discount) : '-'}</td>
                                            <td className="text-right p-3 font-mono font-semibold">{formatCLP(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="space-y-2 max-w-md ml-auto">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal (Neto):</span>
                                <span className="font-mono font-semibold">{formatCLP(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
                                <span>IVA (19%):</span>
                                <span className="font-mono">+ {formatCLP(invoice.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                                <span>TOTAL:</span>
                                <span className="font-mono">{formatCLP(invoice.total)}</span>
                            </div>
                            {invoice.paidAmount > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-blue-700 dark:text-blue-400">
                                        <span>Pagado:</span>
                                        <span className="font-mono">- {formatCLP(invoice.paidAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                                        <span>SALDO:</span>
                                        <span className={cn("font-mono", balance > 0 ? "text-red-600" : "text-green-600")}>
                                            {formatCLP(balance)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payments */}
                    {invoice.payments.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Historial de Pagos
                            </h3>
                            <div className="space-y-2">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{formatCLP(payment.amount)}</p>
                                            <p className="text-xs text-gray-500">
                                                {payment.method} • {new Date(payment.paidAt).toLocaleDateString('es-CL')}
                                                {payment.reference && ` • Ref: ${payment.reference}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Form */}
                    {showPaymentForm && balance > 0 && (
                        <form onSubmit={handleRegisterPayment} className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Registrar Pago</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monto *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={balance}
                                        step="100"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Saldo pendiente: {formatCLP(balance)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Método *</label>
                                    <select
                                        required
                                        value={paymentData.method}
                                        onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="CASH">Efectivo</option>
                                        <option value="CARD">Tarjeta</option>
                                        <option value="TRANSFER">Transferencia</option>
                                        <option value="MERCADOPAGO">MercadoPago</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Referencia</label>
                                    <input
                                        type="text"
                                        value={paymentData.reference}
                                        onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                        placeholder="Número de transferencia, cheque, etc."
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Registrar Pago
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div>
                            <h3 className="font-semibold mb-2">Notas</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-2">
                    {balance > 0 && invoice.paymentStatus !== 'CANCELLED' && !showPaymentForm && (
                        <Button onClick={() => setShowPaymentForm(true)} className="gap-2">
                            <DollarSign className="w-4 h-4" />
                            Registrar Pago
                        </Button>
                    )}
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Mail className="w-4 h-4" />
                        Enviar por Email
                    </Button>
                </div>
            </div>
        </div>
    );
}
