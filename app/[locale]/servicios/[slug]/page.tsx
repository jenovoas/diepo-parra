import { notFound } from "next/navigation";
import { services } from "@/lib/data/services";
import { ServiceDetail } from "@/components/services/ServiceDetail";
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
    "kine-domicilio": "domicilio",
    "video_asesoria": "video_asesoria"
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

    // Parse features from translations if available
    let features: { title: string; description: string }[] | undefined = undefined;
    try {
        const featuresObj = t.raw('features') as Record<string, { title: string; desc: string }>;
        if (featuresObj) {
            features = Object.values(featuresObj).map(f => ({
                title: f.title,
                description: f.desc
            }));
        }
    } catch {
        // Features might not be defined for all services yet
    }

    return (
        <ServiceDetail
            title={t('title')}
            subtitle={locale === 'es' ? 'Servicio Especializado' : 'Specialized Service'}
            description={t('longDesc')}
            imageSrc={service.image}
            benefits={benefits}
            features={features}
            price={service.price}
            duration={service.duration}
            color={service.color.replace('text-', '')} // ServiceDetail expects color name like 'teal-600' not 'text-teal-600'
            id={service.id}
        />
    )
}
