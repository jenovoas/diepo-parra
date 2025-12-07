import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FinancialDashboard } from '@/components/admin/FinancialDashboard';

export const metadata: Metadata = {
    title: 'Dashboard Financiero | Diego Parra',
    description: 'Resumen financiero y reportes contables',
};

export default async function FinancialDashboardPage() {
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
            <FinancialDashboard />
        </div>
    );
}
