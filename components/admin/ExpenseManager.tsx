"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Receipt, Plus, Edit2, Trash2, Check, X, TrendingDown } from "lucide-react";
import { formatCLP } from "@/lib/utils/tax-calculator";
import { cn } from "@/lib/utils/cn";

interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    isDeductible: boolean;
    hasInvoice: boolean;
    supplierRut: string | null;
    supplierName: string | null;
    invoiceNumber: string | null;
    paymentMethod: string;
    paidAt: Date;
    receiptUrl: string | null;
    notes: string | null;
}

const CATEGORIES = [
    { value: 'SUPPLIES', label: 'Insumos Médicos', icon: '💊' },
    { value: 'RENT', label: 'Arriendo', icon: '🏢' },
    { value: 'UTILITIES', label: 'Servicios Básicos', icon: '💡' },
    { value: 'SALARIES', label: 'Sueldos', icon: '👥' },
    { value: 'EQUIPMENT', label: 'Equipamiento', icon: '🔧' },
    { value: 'MARKETING', label: 'Marketing', icon: '📢' },
    { value: 'OTHER', label: 'Otros', icon: '📋' },
];

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CARD', label: 'Tarjeta' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'CHECK', label: 'Cheque' },
];

export function ExpenseManager() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        category: 'SUPPLIES',
        amount: '',
        isDeductible: true,
        hasInvoice: false,
        supplierRut: '',
        supplierName: '',
        invoiceNumber: '',
        paymentMethod: 'TRANSFER',
        paidAt: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const res = await fetch('/api/expenses');
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body: any = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            if (editingId) {
                body.id = editingId;
            }

            const res = await fetch('/api/expenses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar');
            }

            await loadExpenses();
            resetForm();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setFormData({
            description: expense.description,
            category: expense.category,
            amount: expense.amount.toString(),
            isDeductible: expense.isDeductible,
            hasInvoice: expense.hasInvoice,
            supplierRut: expense.supplierRut || '',
            supplierName: expense.supplierName || '',
            invoiceNumber: expense.invoiceNumber || '',
            paymentMethod: expense.paymentMethod,
            paidAt: new Date(expense.paidAt).toISOString().split('T')[0],
            notes: expense.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

        try {
            const res = await fetch(`/api/expenses?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error al eliminar');

            await loadExpenses();
        } catch (error) {
            alert('Error al eliminar el gasto');
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            category: 'SUPPLIES',
            amount: '',
            isDeductible: true,
            hasInvoice: false,
            supplierRut: '',
            supplierName: '',
            invoiceNumber: '',
            paymentMethod: 'TRANSFER',
            paidAt: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const deductibleTotal = expenses.filter(e => e.isDeductible).reduce((sum, exp) => sum + exp.amount, 0);

    if (loading) {
        return <div className="text-center py-8">Cargando gastos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Gestión de Gastos</h2>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancelar' : 'Nuevo Gasto'}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Gastos</span>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold">{formatCLP(totalExpenses)}</p>
                    <p className="text-xs text-gray-500 mt-1">{expenses.length} registros</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700 dark:text-green-400">Deducibles</span>
                        <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCLP(deductibleTotal)}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        {Math.round((deductibleTotal / totalExpenses) * 100) || 0}% del total
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">No Deducibles</span>
                        <X className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold">{formatCLP(totalExpenses - deductibleTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {Math.round(((totalExpenses - deductibleTotal) / totalExpenses) * 100) || 0}% del total
                    </p>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                        {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Descripción *</label>
                            <input
                                type="text"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Categoría *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Monto *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="100"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Método de Pago *</label>
                            <select
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method.value} value={method.value}>{method.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Pago *</label>
                            <input
                                type="date"
                                required
                                value={formData.paidAt}
                                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isDeductible}
                                    onChange={(e) => setFormData({ ...formData, isDeductible: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Gasto Deducible</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasInvoice}
                                    onChange={(e) => setFormData({ ...formData, hasInvoice: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Tiene Factura</span>
                            </label>
                        </div>

                        {formData.hasInvoice && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">RUT Proveedor</label>
                                    <input
                                        type="text"
                                        value={formData.supplierRut}
                                        onChange={(e) => setFormData({ ...formData, supplierRut: e.target.value })}
                                        placeholder="12.345.678-9"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre Proveedor</label>
                                    <input
                                        type="text"
                                        value={formData.supplierName}
                                        onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Número de Factura</label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Notas</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" className="gap-2">
                            <Check className="w-4 h-4" />
                            {editingId ? 'Actualizar' : 'Registrar'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {/* Expense List */}
            <div className="space-y-3">
                {expenses.map((expense) => {
                    const category = CATEGORIES.find(c => c.value === expense.category);
                    return (
                        <div
                            key={expense.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{category?.icon}</span>
                                        <h3 className="font-semibold">{expense.description}</h3>
                                        {expense.isDeductible && (
                                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                                Deducible
                                            </span>
                                        )}
                                        {expense.hasInvoice && (
                                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                                Con Factura
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>{category?.label}</span>
                                        <span>•</span>
                                        <span>{new Date(expense.paidAt).toLocaleDateString('es-CL')}</span>
                                        <span>•</span>
                                        <span>{PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label}</span>
                                    </div>
                                    {expense.supplierName && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Proveedor: {expense.supplierName}
                                            {expense.invoiceNumber && ` - Factura: ${expense.invoiceNumber}`}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold font-mono">{formatCLP(expense.amount)}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(expense)}
                                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(expense.id)}
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {expenses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No hay gastos registrados. Crea uno nuevo para comenzar.
                </div>
            )}
        </div>
    );
}
