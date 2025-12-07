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

        // TODO: Here we would call the backend to create a MercadoPago Preference
        // const response = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ title, price }) })
        // const data = await response.json()
        // window.location.href = data.init_point

        // SIMULATION: Simulate API delay and redirect to success
        setTimeout(() => {
            setIsLoading(false);
            // Simulate 80% success rate for testing
            const isSuccess = Math.random() > 0.1;
            if (isSuccess) {
                router.push("/checkout/success");
            } else {
                router.push("/checkout/failure");
            }
        }, 1500);
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
