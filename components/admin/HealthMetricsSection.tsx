"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, TrendingUp, Heart, Activity as ActivityIcon, Moon, Weight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils/cn";

type HealthMetric = {
    id?: string;
    type: string;
    value: number;
    unit: string;
    source: string;
    recordedAt: Date;
    notes?: string;
};

interface HealthMetricsSectionProps {
    metrics: HealthMetric[];
    readOnly?: boolean;
    onAdd?: (metric: HealthMetric) => void;
    onDelete?: (id: string) => void;
}

const METRIC_TYPES = [
    { value: "STEPS", label: "Pasos", unit: "pasos", icon: ActivityIcon },
    { value: "HEART_RATE", label: "Frecuencia Cardíaca", unit: "bpm", icon: Heart },
    { value: "SLEEP", label: "Sueño", unit: "horas", icon: Moon },
    { value: "WEIGHT", label: "Peso", unit: "kg", icon: Weight },
    { value: "BLOOD_PRESSURE", label: "Presión Arterial", unit: "mmHg", icon: TrendingUp },
];

const SOURCES = [
    { value: "MANUAL", label: "Manual" },
    { value: "APPLE_HEALTH", label: "Apple Health" },
    { value: "GOOGLE_FIT", label: "Google Fit" },
    { value: "FITBIT", label: "Fitbit" },
];

export function HealthMetricsSection({
    metrics,
    readOnly = false,
    onAdd,
    onDelete
}: HealthMetricsSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedMetricType, setSelectedMetricType] = useState<string>("STEPS");
    const [formData, setFormData] = useState<Omit<HealthMetric, 'id'>>({
        type: "STEPS",
        value: 0,
        unit: "pasos",
        source: "MANUAL",
        recordedAt: new Date()
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd?.(formData);
        setFormData({
            type: "STEPS",
            value: 0,
            unit: "pasos",
            source: "MANUAL",
            recordedAt: new Date()
        });
        setIsAdding(false);
    };

    const handleTypeChange = (type: string) => {
        const metricType = METRIC_TYPES.find(m => m.value === type);
        setFormData({
            ...formData,
            type,
            unit: metricType?.unit || "unidad"
        });
    };

    // Group metrics by type for charts
    const metricsByType = metrics.reduce((acc, metric) => {
        if (!acc[metric.type]) acc[metric.type] = [];
        acc[metric.type].push(metric);
        return acc;
    }, {} as Record<string, HealthMetric[]>);

    // Prepare chart data
    const getChartData = (type: string) => {
        const data = metricsByType[type] || [];
        return data
            .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
            .map(m => ({
                date: format(new Date(m.recordedAt), 'dd/MM', { locale: es }),
                value: m.value,
                fullDate: format(new Date(m.recordedAt), 'dd MMM yyyy', { locale: es })
            }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Métricas de Salud
                </h3>
                {!readOnly && !isAdding && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Métrica
                    </Button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && !readOnly && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Tipo de Métrica *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            >
                                {METRIC_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Valor *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                                    placeholder="0"
                                />
                                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-text-sec dark:text-gray-400 flex items-center">
                                    {formData.unit}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Fuente *
                            </label>
                            <select
                                required
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            >
                                {SOURCES.map(source => (
                                    <option key={source.value} value={source.value}>
                                        {source.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Fecha de Registro *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.recordedAt.toISOString().slice(0, 16)}
                                onChange={(e) => setFormData({ ...formData, recordedAt: new Date(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Notas
                            </label>
                            <textarea
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary outline-none resize-none"
                                placeholder="Notas adicionales..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsAdding(false);
                                setFormData({
                                    type: "STEPS",
                                    value: 0,
                                    unit: "pasos",
                                    source: "MANUAL",
                                    recordedAt: new Date()
                                });
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar</Button>
                    </div>
                </form>
            )}

            {/* Metric Type Selector */}
            {metrics.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {METRIC_TYPES.filter(mt => metricsByType[mt.value]?.length > 0).map(metricType => {
                        const Icon = metricType.icon;
                        return (
                            <button
                                key={metricType.value}
                                type="button"
                                onClick={() => setSelectedMetricType(metricType.value)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap",
                                    selectedMetricType === metricType.value
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {metricType.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Chart */}
            {metricsByType[selectedMetricType]?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-text-main dark:text-white mb-4">
                        {METRIC_TYPES.find(m => m.value === selectedMetricType)?.label} - Últimos registros
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getChartData(selectedMetricType)}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="date"
                                className="text-xs text-text-sec dark:text-gray-400"
                            />
                            <YAxis className="text-xs text-text-sec dark:text-gray-400" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--primary)', r: 4 }}
                                activeDot={{ r: 6 }}
                                name={METRIC_TYPES.find(m => m.value === selectedMetricType)?.unit || "valor"}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Metrics List */}
            {metricsByType[selectedMetricType]?.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-text-sec dark:text-gray-400">Registros Recientes</h4>
                    {metricsByType[selectedMetricType]
                        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                        .slice(0, 5)
                        .map((metric, idx) => (
                            <div
                                key={metric.id || idx}
                                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold text-primary">
                                        {metric.value} {metric.unit}
                                    </p>
                                    <p className="text-xs text-text-sec dark:text-gray-400">
                                        {format(new Date(metric.recordedAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                                    </p>
                                    {metric.notes && (
                                        <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
                                            {metric.notes}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-text-sec dark:text-gray-400">
                                    {SOURCES.find(s => s.value === metric.source)?.label}
                                </span>
                            </div>
                        ))}
                </div>
            )}

            {metrics.length === 0 && !isAdding && (
                <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-text-sec dark:text-gray-400 italic">
                        No hay métricas de salud registradas
                    </p>
                    <p className="text-sm text-text-sec dark:text-gray-500 mt-1">
                        Agrega métricas manualmente o conecta dispositivos de salud
                    </p>
                </div>
            )}
        </div>
    );
}
