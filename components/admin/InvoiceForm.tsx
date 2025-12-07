"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FileText, Plus, DollarSign, Calendar, User, X, Check } from "lucide-react";
import { formatCLP, calculateInvoiceTotals } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";

interface ServicePrice {
    id: string;
    name: string;
    basePrice: number;
    finalPrice: number;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    servicePriceId?: string;
}

export function InvoiceForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<ServicePrice[]>([]);
    const [formData, setFormData] = useState({
        invoiceType: 'BOLETA',
        clientName: '',
        clientRut: '',
        clientEmail: '',
        dueDate: '',
        notes: '',
    });
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, discount: 0 },
    ]);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const res = await fetch('/api/service-prices?activeOnly=true');
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const selectService = (index: number, serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            updateItem(index, 'description', service.name);
            updateItem(index, 'unitPrice', service.basePrice);
            updateItem(index, 'servicePriceId', serviceId);
        }
    };

    const totals = calculateInvoiceTotals(items);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items,
                    dueDate: formData.dueDate || undefined,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al crear factura');
            }

            alert('Factura creada exitosamente');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Nueva Factura/Boleta
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Documento *</label>
                        <select
                            required
                            value={formData.invoiceType}
                            onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="BOLETA">Boleta</option>
                            <option value="FACTURA">Factura</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Vencimiento</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Cliente *</label>
                        <input
                            type="text"
                            required
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">RUT Cliente</label>
                        <input
                            type="text"
                            value={formData.clientRut}
                            onChange={(e) => setFormData({ ...formData, clientRut: e.target.value })}
                            placeholder="12.345.678-9"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Email Cliente</label>
                        <input
                            type="email"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Items</h4>
                        <Button type="button" size="sm" onClick={addItem} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Agregar Item
                        </Button>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="col-span-4">
                                <label className="block text-xs font-medium mb-1">Servicio/Descripción</label>
                                <select
                                    value={item.servicePriceId || ''}
                                    onChange={(e) => e.target.value ? selectService(index, e.target.value) : updateItem(index, 'description', '')}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Personalizado...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {!item.servicePriceId && (
                                    <input
                                        type="text"
                                        required
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        placeholder="Descripción personalizada"
                                        className="w-full px-2 py-1 text-sm border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.5"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Precio Unit.</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="100"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Descuento</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={item.discount}
                                    onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="col-span-1">
                                <span className="block text-xs font-medium mb-1">Subtotal</span>
                                <span className="block text-sm font-mono">
                                    {formatCLP((item.quantity * item.unitPrice) - item.discount)}
                                </span>
                            </div>

                            <div className="col-span-1 flex items-end">
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal (Neto):</span>
                            <span className="font-mono font-semibold">{formatCLP(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
                            <span>IVA (19%):</span>
                            <span className="font-mono">+ {formatCLP(totals.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-blue-300 dark:border-blue-700 pt-2">
                            <span>TOTAL:</span>
                            <span className="font-mono">{formatCLP(totals.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Notas</label>
                    <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="mt-6 flex gap-2">
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Check className="w-4 h-4" />
                        {loading ? 'Creando...' : 'Crear Factura'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
