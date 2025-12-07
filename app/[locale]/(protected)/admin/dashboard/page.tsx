import { prisma } from "@/lib/prisma";
import { Calendar, CheckCircle, Clock, Search, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
    // 1. Fetch appointments with selected patient fields
    const appointments = await prisma.appointment.findMany({
        select: {
            id: true,
            date: true,
            serviceType: true,
            status: true,
            notes: true,
            patient: {
                select: {
                    fullName: true,
                    phone: true,
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    // 2. Calculate Stats using prisma.count
    const total = await prisma.appointment.count();
    const pending = await prisma.appointment.count({ where: { status: 'PENDING' } });
    const confirmed = await prisma.appointment.count({ where: { status: 'CONFIRMED' } });

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-accent text-primary">Panel de Administración</h1>
                    <p className="text-text-sec">Gestiona citas y pacientes desde un solo lugar.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                    </Button>
                    <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Paciente
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-text-sec text-sm">Total Citas</p>
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-text-sec text-sm">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{pending}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-text-sec text-sm">Confirmadas</p>
                        <p className="text-2xl font-bold text-gray-900">{confirmed}</p>
                    </div>
                </div>
            </div>

            {/* Appointment List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg text-gray-900">Últimas Reservas</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-text-sec text-sm font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Fecha/Hora</th>
                                <th className="px-6 py-4">Servicio</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{apt.patient.fullName}</div>
                                        <div className="text-sm text-text-sec">{apt.patient.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(apt.date).toLocaleDateString()}
                                        <br />
                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {apt.serviceType}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {apt.status === 'PENDING' && (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-text-sec">
                                        No hay citas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
