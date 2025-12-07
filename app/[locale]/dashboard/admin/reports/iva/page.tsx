import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IVAReport } from '@/components/admin/reports/IVAReport';

export const metadata: Metadata = {
    title: 'Reporte de IVA | Diego Parra',
    description: 'Reporte mensual de IVA para declaración',
};

export default async function IVAReportPage() {
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
            <IVAReport />
        </div>
    );
}
