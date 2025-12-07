"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DollarSign, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCLP } from "@/lib/utils/tax-calculator";

interface ServicePrice {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    basePrice: number;
    taxRate: number;
    taxAmount: number;
    finalPrice: number;
    durationMinutes: number | null;
    isActive: boolean;
}

const CATEGORIES = [
    { value: 'KINESIOLOGIA', label: 'Kinesiología' },
    { value: 'ACUPUNTURA', label: 'Acupuntura' },
    { value: 'MASAJES', label: 'Masajes' },
    { value: 'EVALUACION', label: 'Evaluación' },
    { value: 'OTHER', label: 'Otro' },
];

export function ServicePriceManager() {
    const [prices, setPrices] = useState<ServicePrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'KINESIOLOGIA',
        basePrice: '',
        durationMinutes: '',
    });

    useEffect(() => {
        loadPrices();
    }, []);

    const loadPrices = async () => {
        try {
            const res = await fetch('/api/service-prices');
            const data = await res.json();
            setPrices(data);
        } catch (error) {
            console.error('Error loading prices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const basePrice = parseFloat(formData.basePrice);
        if (isNaN(basePrice) || basePrice <= 0) {
            alert('Precio base debe ser mayor a 0');
            return;
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body: any = {
                ...formData,
                basePrice,
                durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
            };

            if (editingId) {
                body.id = editingId;
            }

            const res = await fetch('/api/service-prices', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar');
            }

            await loadPrices();
            resetForm();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEdit = (price: ServicePrice) => {
        setEditingId(price.id);
        setFormData({
            name: price.name,
            description: price.description || '',
            category: price.category || 'KINESIOLOGIA',
            basePrice: price.basePrice.toString(),
            durationMinutes: price.durationMinutes?.toString() || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de desactivar este servicio?')) return;

        try {
            const res = await fetch(`/api/service-prices?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error al eliminar');

            await loadPrices();
        } catch (error) {
            alert('Error al eliminar el servicio');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'KINESIOLOGIA',
            basePrice: '',
            durationMinutes: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const calculatePreview = () => {
        const base = parseFloat(formData.basePrice) || 0;
        const tax = Math.round(base * 0.19);
        const total = base + tax;
        return { base, tax, total };
    };

    const preview = calculatePreview();

    if (loading) {
        return <div className="text-center py-8">Cargando precios...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Gestión de Precios</h2>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancelar' : 'Nuevo Servicio'}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                        {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Categoría</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Precio Base (sin IVA) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="100"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
                            <input
                                type="number"
                                min="0"
                                step="5"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {/* Price Preview */}
                    {formData.basePrice && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Vista Previa de Precios</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Precio Base (Neto):</span>
                                    <span className="font-mono">{formatCLP(preview.base)}</span>
                                </div>
                                <div className="flex justify-between text-green-700 dark:text-green-400">
                                    <span>IVA (19%):</span>
                                    <span className="font-mono">+ {formatCLP(preview.tax)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-blue-300 dark:border-blue-700 pt-1">
                                    <span>Precio Final:</span>
                                    <span className="font-mono">{formatCLP(preview.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" className="gap-2">
                            <Check className="w-4 h-4" />
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {/* Price List */}
            <div className="grid gap-4">
                {prices.map((price) => (
                    <div
                        key={price.id}
                        className={cn(
                            "bg-white dark:bg-gray-800 p-4 rounded-lg border transition-all",
                            price.isActive
                                ? "border-gray-200 dark:border-gray-700"
                                : "border-gray-300 dark:border-gray-600 opacity-60"
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{price.name}</h3>
                                    {price.category && (
                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {CATEGORIES.find(c => c.value === price.category)?.label}
                                        </span>
                                    )}
                                    {!price.isActive && (
                                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                                            Inactivo
                                        </span>
                                    )}
                                </div>
                                {price.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{price.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Neto:</span>{' '}
                                        <span className="font-mono font-semibold">{formatCLP(price.basePrice)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">IVA:</span>{' '}
                                        <span className="font-mono text-green-600 dark:text-green-400">
                                            {formatCLP(price.taxAmount)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Total:</span>{' '}
                                        <span className="font-mono font-bold text-lg">{formatCLP(price.finalPrice)}</span>
                                    </div>
                                    {price.durationMinutes && (
                                        <div>
                                            <span className="text-gray-500">Duración:</span>{' '}
                                            <span>{price.durationMinutes} min</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(price)}
                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                {price.isActive && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(price.id)}
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {prices.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No hay servicios registrados. Crea uno nuevo para comenzar.
                </div>
            )}
        </div>
    );
}
