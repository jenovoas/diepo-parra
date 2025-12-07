import { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';

export const metadata: Metadata = {
    title: 'Pago Exitoso | Diego Parra',
    description: 'Tu pago ha sido procesado exitosamente',
};

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-background py-12">
            <Suspense fallback={
                <div className="container mx-auto px-4 text-center">
                    <p>Cargando...</p>
                </div>
            }>
                <CheckoutSuccess />
            </Suspense>
        </div>
    );
}
