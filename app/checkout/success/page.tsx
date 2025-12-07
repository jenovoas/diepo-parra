import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold font-accent text-text-main mb-4">¡Pago Exitoso!</h1>
                <p className="text-text-sec mb-8">
                    Tu reserva ha sido confirmada correctamente. Hemos enviado los detalles y el comprobante a tu correo electrónico.
                </p>

                <div className="space-y-3">
                    <Link href="/">
                        <Button className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
