"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
    price: string;
}

export function PaymentButton({ price }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setIsLoading(true);

        // Llamada real al backend para crear la preferencia de MercadoPago
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price })
            });
            const data = await response.json();
            if (data.init_point) {
                window.location.href = data.init_point;
                return;
            } else {
                console.error("No init_point returned");
                router.push("/checkout/failure");
                return;
            }
        } catch (error) {
            console.error("Payment Error:", error);
            router.push("/checkout/failure");
            return;
        }

        // ---
        // SIMULACIÓN (descomentar para pruebas locales sin backend):
        // setTimeout(() => {
        //     setIsLoading(false);
        //     // Simula 80% de éxito
        //     const isSuccess = Math.random() > 0.1;
        //     if (isSuccess) {
        //         router.push("/checkout/success");
        //     } else {
        //         router.push("/checkout/failure");
        //     }
        // }, 1500);
        // ---

    };

    return (
        <Button
            size="lg"
            className="w-full md:w-auto px-8 bg-black text-white hover:bg-gray-800"
            onClick={handlePayment}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                </>
            ) : (
                <>
                    Pagar Online ({price})
                    <CreditCard className="w-4 h-4 ml-2" />
                </>
            )}
        </Button>
    );
}
