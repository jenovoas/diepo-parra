import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutFailurePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-3xl font-bold font-accent text-text-main dark:text-white mb-4">Pago Rechazado</h1>
                <p className="text-text-sec dark:text-gray-400 mb-8">
                    Hubo un problema al procesar tu pago. No se ha realizado ningún cargo. Por favor, intenta nuevamente o usa otro medio de pago.
                </p>

                <div className="space-y-3">
                    <Link href="/#services">
                        <Button variant="outline" className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Intentar Nuevamente
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
