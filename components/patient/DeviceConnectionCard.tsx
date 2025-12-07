"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Smartphone, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DeviceConnection = {
    id: string;
    provider: string;
    lastSync: Date | null;
    isActive: boolean;
};

interface DeviceConnectionCardProps {
    patientId: string;
    connections: DeviceConnection[];
    onConnect?: (provider: string) => Promise<void>;
    onSync?: (provider: string) => Promise<void>;
    onDisconnect?: (connectionId: string) => Promise<void>;
}

const PROVIDERS = [
    {
        id: 'GOOGLE',
        name: 'Google Fit',
        icon: '🏃',
        color: 'bg-blue-500',
        description: 'Pasos, frecuencia cardíaca, sueño',
    },
    {
        id: 'FITBIT',
        name: 'Fitbit',
        icon: '⌚',
        color: 'bg-teal-500',
        description: 'Actividad, sueño, peso',
    },
    {
        id: 'APPLE',
        name: 'Apple Health',
        icon: '🍎',
        color: 'bg-gray-500',
        description: 'Requiere app iOS (próximamente)',
        disabled: true,
    },
];

export function DeviceConnectionCard({
    patientId,
    connections,
    onConnect,
    onSync,
    onDisconnect,
}: DeviceConnectionCardProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);

    const getConnection = (providerId: string) => {
        return connections.find(c => c.provider === providerId);
    };

    const handleConnect = async (providerId: string) => {
        setLoading(providerId);
        try {
            await onConnect?.(providerId);
        } finally {
            setLoading(null);
        }
    };

    const handleSync = async (providerId: string) => {
        setSyncing(providerId);
        try {
            await onSync?.(providerId);
        } finally {
            setSyncing(null);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        if (confirm('¿Estás seguro de desconectar este dispositivo?')) {
            try {
                await onDisconnect?.(connectionId);
            } catch (error) {
                console.error('Error disconnecting:', error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-primary">Dispositivos de Salud</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {PROVIDERS.map((provider) => {
                    const connection = getConnection(provider.id);
                    const isConnected = !!connection;
                    const isLoading = loading === provider.id;
                    const isSyncing = syncing === provider.id;

                    return (
                        <div
                            key={provider.id}
                            className={cn(
                                "p-4 rounded-lg border transition-all",
                                isConnected
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                                provider.disabled && "opacity-50"
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-2xl", provider.color)}>
                                        {provider.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-text-main dark:text-white flex items-center gap-2">
                                            {provider.name}
                                            {isConnected && (
                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            )}
                                        </h4>
                                        <p className="text-xs text-text-sec dark:text-gray-400">
                                            {provider.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isConnected && connection && (
                                <div className="mb-3 p-2 bg-white dark:bg-gray-900/50 rounded text-xs">
                                    <p className="text-text-sec dark:text-gray-400">
                                        <strong>Última sincronización:</strong>{' '}
                                        {connection.lastSync
                                            ? new Date(connection.lastSync).toLocaleString('es-CL')
                                            : 'Nunca'}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {!isConnected ? (
                                    <Button
                                        onClick={() => handleConnect(provider.id)}
                                        disabled={isLoading || provider.disabled}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        {isLoading ? 'Conectando...' : 'Conectar'}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => handleSync(provider.id)}
                                            disabled={isSyncing}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 gap-2"
                                        >
                                            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                                        </Button>
                                        <Button
                                            onClick={() => handleDisconnect(connection.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>💡 Tip:</strong> Conecta tus dispositivos de salud para sincronizar automáticamente
                    tus métricas de actividad, sueño y salud cardiovascular.
                </p>
            </div>
        </div>
    );
}
