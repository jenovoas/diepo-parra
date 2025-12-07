import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-900">Acceso Restringido</h1>
                    <p className="text-gray-600">No tienes permisos para acceder a esta área. Si crees que es un error, contacta al administrador.</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="mt-4">Volver al Portal de Paciente</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
