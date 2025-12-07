"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Registration logic would typically call an API route (/api/auth/register)
        // For this MVP step, we will assume the user needs to contact admin or we mock it.
        // However, to be functional, I should probably add a register API route or just tell them to contact.
        // Given the prompt requirements for "Patient Registration", let's implement a basic user creation API call.

        // NOTE: I haven't implemented /api/auth/register yet. I will do that next.
        // For now, let's just show a placeholders alert
        alert("Funcionalidad de registro en construcción. Por favor contacta al administrador.");
        // In a real app: await fetch("/api/auth/register", ...)
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold font-accent text-primary">Crear Cuenta</h1>
                    <p className="text-text-sec">Únete para gestionar tus tratamientos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full py-6 text-lg">
                            Registrarse
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-text-sec">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
