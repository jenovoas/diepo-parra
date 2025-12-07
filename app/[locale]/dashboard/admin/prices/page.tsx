import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ServicePriceManager } from '@/components/admin/ServicePriceManager';

export const metadata: Metadata = {
    title: 'Gestión de Precios | Diego Parra',
    description: 'Administración de precios de servicios',
};

export default async function PricesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <ServicePriceManager />
        </div>
    );
}
