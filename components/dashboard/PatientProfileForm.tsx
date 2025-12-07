"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type PatientData = {
    fullName: string;
    phone: string | null;
    birthDate: string;
    condition: string | null;
    medicalHistory: string | null;
};

interface Props {
    initialData?: PatientData;
    userName: string;
    userEmail: string;
}

export function PatientProfileForm({ initialData, userName, userEmail }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || userName || '',
        phone: initialData?.phone || '',
        birthDate: initialData?.birthDate || '',
        condition: initialData?.condition || '',
        medicalHistory: initialData?.medicalHistory || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch('/api/patients', {
                method: 'POST', // Or PUT if you update the API to handle upsert correctly
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    consentMedical: true, // Assuming consent for now for existing profiles
                    consentContact: true
                })
            });

            if (!res.ok) throw new Error('Error al guardar');

            setMsg({ type: 'success', text: 'Datos actualizados correctamente.' });
            router.refresh();
        } catch (error) {
            setMsg({ type: 'error', text: 'Ocurrió un error al guardar los datos.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read Only Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cuenta)</label>
                    <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Información Personal
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+569..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Antecedentes Médicos
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condición / Motivo de Consulta Principal</label>
                    <input
                        type="text"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        placeholder="Ej: Dolor lumbar, Esguince de tobillo..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Historial Médico Relevante</label>
                    <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Operaciones previas, alergias, enfermedades crónicas..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {msg.text}
                </div>
            )}

            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                </Button>
            </div>
        </form>
    );
}
