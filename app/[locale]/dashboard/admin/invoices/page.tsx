import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';

export const metadata: Metadata = {
    title: 'Gestión de Facturas | Diego Parra',
    description: 'Administración completa de facturas y pagos',
};

export default async function InvoicesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <InvoiceManagement />
        </div>
    );
}
