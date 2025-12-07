"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Credenciales inválidas");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error inesperado");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold font-accent text-primary">Bienvenido</h1>
                    <p className="text-text-sec">Ingresa a tu cuenta para gestionar tus citas.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full py-6 text-lg">
                            Iniciar Sesión
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-text-sec">
                        ¿Aún no tienes cuenta?{" "}
                        <Link href="/register" className="text-primary font-bold hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
