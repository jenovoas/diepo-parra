import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ExpenseManager } from '@/components/admin/ExpenseManager';

export const metadata: Metadata = {
    title: 'Gestión de Gastos | Diego Parra',
    description: 'Administración de gastos y egresos',
};

export default async function ExpensesPage() {
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
            <ExpenseManager />
        </div>
    );
}
