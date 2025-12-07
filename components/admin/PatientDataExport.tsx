"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, FileText, FileJson, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PatientDataExportProps {
    patientId: string;
    patientName: string;
}

export function PatientDataExport({ patientId, patientName }: PatientDataExportProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleExport = async (format: 'pdf' | 'json') => {
        setLoading(format);

        try {
            const response = await fetch('/api/patient/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId,
                    format,
                }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ficha-${patientName.replace(/\s+/g, '-')}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error al exportar datos');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Exportar Datos del Paciente
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                        Descarga una copia completa de la ficha clínica en formato PDF o JSON
                        (Derecho de Portabilidad - Ley 19.628)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleExport('pdf')}
                            disabled={loading !== null}
                            size="sm"
                            className="gap-2"
                        >
                            {loading === 'pdf' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            Exportar PDF
                        </Button>
                        <Button
                            onClick={() => handleExport('json')}
                            disabled={loading !== null}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                        >
                            {loading === 'json' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileJson className="w-4 h-4" />
                            )}
                            Exportar JSON
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
