"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/Button";
import { Pen, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onCancel?: () => void;
    title?: string;
    description?: string;
}

export function SignaturePad({
    onSave,
    onCancel,
    title = "Firma Electrónica",
    description = "Dibuje su firma en el recuadro a continuación",
}: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const handleClear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const handleSave = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureData = sigCanvas.current.toDataURL("image/png");
            onSave(signatureData);
        }
    };

    const handleBegin = () => {
        setIsEmpty(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Pen className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                </div>
                <p className="text-sm text-text-sec dark:text-gray-400">{description}</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                        className: "w-full h-48 cursor-crosshair",
                    }}
                    onBegin={handleBegin}
                    backgroundColor="white"
                    penColor="black"
                />
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-300">
                    <strong>Nota Legal:</strong> Al firmar este documento, usted certifica que la información
                    es correcta y autoriza el tratamiento según lo establecido en la Ley 20.584.
                </p>
            </div>

            <div className="flex gap-3 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1 gap-2"
                    disabled={isEmpty}
                >
                    <RotateCcw className="w-4 h-4" />
                    Limpiar
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 gap-2"
                    disabled={isEmpty}
                >
                    <Check className="w-4 h-4" />
                    Firmar
                </Button>
            </div>
        </div>
    );
}
