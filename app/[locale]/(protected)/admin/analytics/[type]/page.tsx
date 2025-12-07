"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/lib/navigation";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AnalyticsType = "patients" | "appointments" | "revenue";

interface PageProps {
    params: { type: AnalyticsType };
}

export default function AnalyticsDetailPage() {
    const params = useParams();
    const type = (params?.type as string) || "patients";
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/analytics/${type}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    const getTitle = () => {
        const titles: Record<string, string> = {
            patients: "Análisis de Pacientes",
            appointments: "Análisis de Citas",
            revenue: "Análisis de Ingresos",
        };
        return titles[type] || "Análisis";
    };

    const getDescription = () => {
        const descriptions: Record<string, string> = {
            patients: "Métricas detalladas sobre pacientes, distribución demográfica y tendencias",
            appointments: "Seguimiento de citas, disponibilidad y eficiencia de programación",
            revenue: "Análisis de ingresos, servicios populares y proyecciones financieras",
        };
        return descriptions[type] || "Datos analíticos detallados";
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Dashboard
                </Link>
                <h1 className="text-4xl font-bold font-accent text-text-main dark:text-white mb-2">
                    {getTitle()}
                </h1>
                <p className="text-text-sec dark:text-gray-400">{getDescription()}</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Descargar Reporte
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">
                            Gráfico Principal
                        </h2>
                        <div className="h-96 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-center text-text-sec dark:text-gray-400">
                            <p>Gráfico de {getTitle().toLowerCase()} (Integración con Chart.js o Recharts pendiente)</p>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-text-sec dark:text-gray-400 mb-1">Métrica Principal</p>
                            <h3 className="text-3xl font-bold text-primary">
                                {data?.primaryMetric || "—"}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-text-sec dark:text-gray-400 mb-1">Cambio vs. Período Anterior</p>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                +{data?.percentChange || "0"}%
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-text-sec dark:text-gray-400 mb-1">Promedio</p>
                            <h3 className="text-2xl font-bold text-text-main dark:text-white">
                                {data?.average || "—"}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Table */}
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">
                    Datos Detallados
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-text-main dark:text-white">
                                    Periodo
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-text-main dark:text-white">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-text-main dark:text-white">
                                    Cambio
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-text-main dark:text-white">
                                    Tendencia
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-text-main dark:text-white">
                                        Semana {i}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-text-main dark:text-white">
                                        {Math.floor(Math.random() * 100) + 20}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                                        +{Math.floor(Math.random() * 20)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                            ↑ Arriba
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
