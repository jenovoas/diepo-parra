import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidad | Diego Parra Kinesiología",
    description: "Política de privacidad y protección de datos personales según Ley 19.628 de Chile",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background py-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold text-primary mb-8">Política de Privacidad</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-text-main dark:text-gray-300">
                    <p className="text-sm text-text-sec dark:text-gray-400">
                        <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL')}
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">1. Introducción</h2>
                        <p>
                            Diego Parra Kinesiología (en adelante, "nosotros" o "el Prestador") se compromete a proteger
                            la privacidad y seguridad de los datos personales de nuestros pacientes y usuarios, en cumplimiento
                            con la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y la
                            <strong> Ley N° 20.584 sobre Derechos y Deberes de los Pacientes</strong> de Chile.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">2. Responsable del Tratamiento de Datos</h2>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p><strong>Nombre:</strong> Diego Parra</p>
                            <p><strong>Actividad:</strong> Kinesiología y Acupuntura</p>
                            <p><strong>Contacto:</strong> [Agregar email de contacto]</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">3. Datos que Recopilamos</h2>

                        <h3 className="text-xl font-semibold text-text-main dark:text-white mt-6 mb-3">3.1 Datos Personales</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Nombre completo</li>
                            <li>RUT o documento de identidad</li>
                            <li>Fecha de nacimiento</li>
                            <li>Dirección</li>
                            <li>Teléfono y correo electrónico</li>
                            <li>Ocupación</li>
                            <li>Contacto de emergencia</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-text-main dark:text-white mt-6 mb-3">3.2 Datos de Salud (Sensibles)</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Historia clínica y anamnesis</li>
                            <li>Diagnósticos médicos</li>
                            <li>Tratamientos y medicamentos</li>
                            <li>Antecedentes quirúrgicos y patológicos</li>
                            <li>Alergias y condiciones crónicas</li>
                            <li>Tipo de sangre</li>
                            <li>Métricas de salud (pasos, frecuencia cardíaca, peso, etc.)</li>
                            <li>Notas de evolución</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-text-main dark:text-white mt-6 mb-3">3.3 Datos de Navegación</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Dirección IP</li>
                            <li>Tipo de navegador y dispositivo</li>
                            <li>Páginas visitadas y tiempo de navegación</li>
                            <li>Cookies técnicas necesarias para el funcionamiento del sitio</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">4. Finalidad del Tratamiento de Datos</h2>
                        <p>Los datos personales y de salud son recopilados y tratados para las siguientes finalidades:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Prestación de servicios médicos:</strong> Diagnóstico, tratamiento y seguimiento de pacientes</li>
                            <li><strong>Gestión de citas:</strong> Programación y recordatorios de consultas</li>
                            <li><strong>Comunicación:</strong> Envío de información relevante sobre tratamientos y servicios</li>
                            <li><strong>Cumplimiento legal:</strong> Obligaciones legales y regulatorias del sector salud</li>
                            <li><strong>Mejora de servicios:</strong> Análisis estadístico anónimo para mejorar la calidad de atención</li>
                            <li><strong>Facturación:</strong> Emisión de boletas y gestión de pagos</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5. Base Legal del Tratamiento</h2>
                        <p>El tratamiento de sus datos se fundamenta en:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Consentimiento explícito:</strong> Usted otorga su consentimiento informado para el tratamiento de datos sensibles de salud (Art. 10, Ley 19.628)</li>
                            <li><strong>Ejecución de contrato:</strong> Necesario para la prestación de servicios médicos contratados</li>
                            <li><strong>Obligación legal:</strong> Cumplimiento de normativas del sector salud (Ley 20.584)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">6. Seguridad de los Datos</h2>
                        <p>Implementamos medidas técnicas y organizativas para proteger sus datos:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Encriptación:</strong> Datos sensibles encriptados con AES-256</li>
                            <li><strong>Acceso restringido:</strong> Solo personal autorizado puede acceder a su ficha clínica</li>
                            <li><strong>Auditoría:</strong> Registro de todos los accesos a datos de pacientes</li>
                            <li><strong>Conexión segura:</strong> Transmisión de datos mediante HTTPS</li>
                            <li><strong>Backups:</strong> Copias de seguridad periódicas encriptadas</li>
                            <li><strong>Retención:</strong> Conservación de datos por 15 años según normativa (Decreto 41)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">7. Sus Derechos (Ley 19.628)</h2>
                        <p>Como titular de los datos, usted tiene derecho a:</p>

                        <div className="space-y-4 mt-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300">Derecho de Acceso (Art. 12)</h4>
                                <p className="text-sm mt-1">Conocer qué datos personales tenemos sobre usted y solicitar una copia</p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 dark:text-green-300">Derecho de Rectificación (Art. 13)</h4>
                                <p className="text-sm mt-1">Corregir datos inexactos o incompletos</p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">Derecho de Cancelación (Art. 14)</h4>
                                <p className="text-sm mt-1">Solicitar la eliminación de sus datos cuando ya no sean necesarios</p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-300">Derecho de Oposición</h4>
                                <p className="text-sm mt-1">Oponerse al tratamiento de sus datos en determinadas circunstancias</p>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-red-900 dark:text-red-300">Derecho a Revocar Consentimiento</h4>
                                <p className="text-sm mt-1">Retirar su consentimiento en cualquier momento</p>
                            </div>
                        </div>

                        <p className="mt-4">
                            Para ejercer estos derechos, puede contactarnos a través de [email de contacto] o en nuestras instalaciones.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">8. Compartir Datos con Terceros</h2>
                        <p>Sus datos pueden ser compartidos únicamente en los siguientes casos:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Profesionales de salud:</strong> Cuando sea necesario para su atención médica (con su consentimiento)</li>
                            <li><strong>Laboratorios:</strong> Para análisis médicos requeridos</li>
                            <li><strong>Aseguradoras:</strong> Para tramitación de reembolsos (con su autorización)</li>
                            <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                        </ul>
                        <p className="mt-2">
                            <strong>No vendemos ni compartimos sus datos con terceros para fines comerciales.</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">9. Cookies</h2>
                        <p>
                            Utilizamos cookies técnicas estrictamente necesarias para el funcionamiento del sitio web
                            (autenticación, preferencias de idioma, etc.). No utilizamos cookies de seguimiento o publicidad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">10. Cambios en la Política de Privacidad</h2>
                        <p>
                            Nos reservamos el derecho de modificar esta política de privacidad. Los cambios serán publicados
                            en esta página con la fecha de actualización correspondiente. Le recomendamos revisar periódicamente
                            esta política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">11. Contacto</h2>
                        <p>
                            Para cualquier consulta sobre esta política de privacidad o el tratamiento de sus datos personales,
                            puede contactarnos:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
                            <p><strong>Email:</strong> [Agregar email]</p>
                            <p><strong>Teléfono:</strong> [Agregar teléfono]</p>
                            <p><strong>Dirección:</strong> [Agregar dirección]</p>
                        </div>
                    </section>

                    <section className="mt-12 p-6 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <h3 className="text-lg font-bold text-primary mb-2">Normativa Aplicable</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Ley N° 19.628 sobre Protección de la Vida Privada</li>
                            <li>• Ley N° 20.584 sobre Derechos y Deberes de los Pacientes</li>
                            <li>• Decreto Supremo N° 41 - Reglamento sobre Ficha Clínica</li>
                            <li>• Resolución Exenta N° 520 - Ficha Clínica Electrónica</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
