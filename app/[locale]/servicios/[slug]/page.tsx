import { notFound } from "next/navigation";
import { services } from "@/lib/data/services";
import { Button } from "@/components/ui/Button";
import { PaymentButton } from "@/components/ui/PaymentButton";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getTranslations } from 'next-intl/server';

// Static generation params for known services
export function generateStaticParams() {
    return services.map((service) => ({
        slug: service.slug,
    }));
}

type Props = {
    params: Promise<{
        slug: string;
        locale: string;
    }>
}

const keyMap: Record<string, string> = {
    "kine-musculo": "kine_musculo",
    "acupuntura-dolor": "acupuntura_dolor",
    "acupuntura-sm": "acupuntura_sm",
    "kine-respiratoria": "kine_respiratoria",
    "masaje": "masaje",
    "kine-domicilio": "domicilio"
};

export default async function ServicePage(props: Props) {
    const params = await props.params;
    const {
        slug,
        locale
    } = params;

    const service = services.find((s) => s.slug === slug);

    if (!service) {
        return notFound();
    }

    const t = await getTranslations(`Services.list.items.${keyMap[service.id]}`);

    // Convert benefits object to array
    const benefitsObj = t.raw('benefits') as Record<string, string>;
    const benefits = Object.values(benefitsObj);

    const Icon = service.icon;

    return (
        <main className="min-h-screen bg-gray-50 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Back Link */}
                <Link href="/#services" className="inline-flex items-center text-text-sec hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {locale === 'es' ? 'Volver a Servicios' : 'Back to Services'}
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header with Color Banner */}
                    <div className={cn("h-48 w-full relative", service.bgColor)}>
                        <div className="absolute inset-0 bg-white/40" />
                        <div className="absolute -bottom-16 left-8 md:left-12 p-6 bg-white rounded-2xl shadow-lg">
                            <Icon className={cn("w-12 h-12", service.color)} />
                        </div>
                    </div>

                    <div className="pt-20 px-8 md:px-12 pb-12">
                        {/* Title & Price Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-4xl font-bold font-accent text-text-main mb-2">{t('title')}</h1>
                                <div className="flex items-center text-text-sec">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{locale === 'es' ? 'Duración:' : 'Duration:'} {service.duration}</span>
                                </div>
                            </div>
                            <div className="text-right max-md:text-left">
                                <p className="text-3xl font-bold text-primary">{service.price}</p>
                                <p className="text-sm text-text-sec">{locale === 'es' ? 'por sesión' : 'per session'}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-100 mb-8" />

                        {/* Long Description */}
                        <div className="prose prose-lg text-text-sec mb-10">
                            <h3 className="text-xl font-semibold text-text-main mb-4">{locale === 'es' ? '¿En qué consiste?' : 'What does it consist of?'}</h3>
                            <p className="leading-relaxed">
                                {t('longDesc')}
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        {benefits && (
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-text-main mb-6">{locale === 'es' ? 'Beneficios Principales' : 'Main Benefits'}</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-text-sec text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Footer */}
                        <div className="bg-primary/5 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
                            <h4 className="text-xl font-bold text-primary">{locale === 'es' ? '¿Listo para comenzar?' : 'Ready to start?'}</h4>
                            <p className="text-text-sec max-w-md mx-auto mb-4">
                                {locale === 'es' ? 'Agenda tu hora ahora o paga tu sesión por adelantado de forma segura.' : 'Book your appointment now or pay for your session in advance securely.'}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <Link href="/#contact" className="w-full sm:w-auto">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-12 border-primary text-primary hover:bg-primary/5">
                                        {locale === 'es' ? 'Reservar Cita (Pagar después)' : 'Book Appointment (Pay later)'}
                                    </Button>
                                </Link>

                                <PaymentButton price={service.price} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
