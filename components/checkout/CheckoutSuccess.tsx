"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Mail, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/lib/navigation";
import { formatCLP } from "@/lib/utils/tax-calculator";

interface InvoiceData {
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    clientName: string;
    total: number;
    subtotal: number;
    tax: number;
    issuedAt: string;
    paymentStatus: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
}

export function CheckoutSuccess() {
    const searchParams = useSearchParams();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paymentId = searchParams.get('payment_id');
    const collectionId = searchParams.get('collection_id');
    const preferenceId = searchParams.get('preference_id');

    useEffect(() => {
        // Try to find invoice by MercadoPago payment ID
        const fetchInvoice = async () => {
            if (!paymentId && !collectionId) {
                setError('No se encontró información del pago');
                setLoading(false);
                return;
            }

            try {
                // Search for invoice with this payment
                const res = await fetch(`/api/invoices?mpPaymentId=${paymentId || collectionId}`);

                if (!res.ok) {
                    throw new Error('No se pudo obtener la factura');
                }

                const invoices = await res.json();

                if (invoices.length > 0) {
                    setInvoice(invoices[0]);
                } else {
                    // Invoice might not be created yet, show success message anyway
                    setError('Tu pago fue procesado exitosamente. Recibirás tu factura por email en breve.');
                }
            } catch (err: any) {
                console.error('Error fetching invoice:', err);
                setError('Tu pago fue procesado exitosamente. Recibirás tu factura por email.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [paymentId, collectionId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Procesando tu pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold text-primary mb-2">¡Pago Exitoso!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Tu pago ha sido procesado correctamente
                </p>
            </div>

            {/* Invoice Details */}
            {invoice ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Factura Electrónica</p>
                                <h2 className="text-3xl font-bold">{invoice.invoiceNumber}</h2>
                            </div>
                            <FileText className="w-12 h-12 opacity-50" />
                        </div>
                    </div>

                    {/* Invoice Body */}
                    <div className="p-6 space-y-6">
                        {/* Client Info */}
                        <div className="grid md:grid-cols-2 gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                                <p className="font-semibold">{invoice.clientName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha de Emisión</p>
                                <p className="font-semibold">
                                    {new Date(invoice.issuedAt).toLocaleDateString('es-CL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="font-semibold mb-4">Detalle de Servicios</h3>
                            <div className="space-y-3">
                                {invoice.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity} x {formatCLP(item.unitPrice)}
                                            </p>
                                        </div>
                                        <p className="font-semibold font-mono">{formatCLP(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal (Neto):</span>
                                <span className="font-mono">{formatCLP(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>IVA (19%):</span>
                                <span className="font-mono">+ {formatCLP(invoice.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl border-t border-gray-300 dark:border-gray-600 pt-3">
                                <span>TOTAL PAGADO:</span>
                                <span className="font-mono text-primary">{formatCLP(invoice.total)}</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-green-700 dark:text-green-400">
                                Factura Pagada
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-6 flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1 gap-2">
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                            <Mail className="w-4 h-4" />
                            Reenviar por Email
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Factura en Proceso</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error || 'Tu factura está siendo generada. La recibirás por email en los próximos minutos.'}
                    </p>
                </div>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold mb-3">¿Qué sigue?</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Recibirás un email de confirmación con tu factura adjunta</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Puedes ver todas tus facturas en tu panel de paciente</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Nos pondremos en contacto contigo para coordinar tu sesión</span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                    <Button className="gap-2">
                        Ver Mi Panel
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline">
                        Volver al Inicio
                    </Button>
                </Link>
            </div>
        </div>
    );
}
