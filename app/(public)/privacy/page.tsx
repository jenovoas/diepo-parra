
export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold font-accent text-primary mb-8">Política de Privacidad</h1>

            <div className="prose prose-slate max-w-none text-text-sec space-y-6">
                <p>
                    Última actualización: {new Date().toLocaleDateString()}
                </p>

                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-4">1. Introducción</h2>
                    <p>
                        Bienvenido al sitio web de Diego Parra, Kinesiólogo y Acupuntor. Nos comprometemos a proteger su información personal y su derecho a la privacidad.
                        Si tiene alguna pregunta o inquietud sobre nuestra política o nuestras prácticas con respecto a su información personal, contáctenos.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-4">2. Información que Recopilamos</h2>
                    <p>
                        Recopilamos información personal que usted nos proporciona voluntariamente cuando se registra en el sitio web,
                        expresa interés en obtener información sobre nosotros o nuestros productos y servicios, participa en actividades en el sitio web o nos contacta.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Datos de identificación personal (Nombre, dirección de correo electrónico, número de teléfono).</li>
                        <li>Información de salud (solo cuando es proporcionada explícitamente para fines de tratamiento y bajo estricta confidencialidad médica).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-4">3. Uso de su Información</h2>
                    <p>
                        Usamos la información personal recopilada a través de nuestro sitio web para una variedad de fines comerciales que se describen a continuación:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Para facilitar la creación de cuentas y el proceso de inicio de sesión.</li>
                        <li>Para enviarle información administrativa.</li>
                        <li>Para agendar y gestionar sus citas médicas.</li>
                        <li>Para proteger nuestros servicios (seguridad y prevención de fraude).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-4">4. Confidencialidad Médica</h2>
                    <p>
                        Toda la información relacionada con su estado de salud, diagnósticos y tratamientos se maneja con la más estricta confidencialidad,
                        cumpliendo con las normativas éticas y legales vigentes para los profesionales de la salud en Chile (Ley 19.628 sobre protección de la vida privada).
                    </p>
                </section>
            </div>
        </div>
    );
}
