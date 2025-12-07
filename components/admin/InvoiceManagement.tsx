"use client";

import React, { useState } from "react";
import { InvoiceList } from "./InvoiceList";
import { InvoiceDetail } from "./InvoiceDetail";
import { InvoiceForm } from "./InvoiceForm";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function InvoiceManagement() {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Factura
                </Button>
            </div>

            {showCreateForm && (
                <InvoiceForm
                    onSuccess={() => {
                        setShowCreateForm(false);
                        handleRefresh();
                    }}
                />
            )}

            <InvoiceList
                key={refreshKey}
                onSelectInvoice={setSelectedInvoiceId}
            />

            {selectedInvoiceId && (
                <InvoiceDetail
                    invoiceId={selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                    onPaymentAdded={handleRefresh}
                />
            )}
        </div>
    );
}
