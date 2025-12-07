import { ServiceDetail } from "@/components/services/ServiceDetail";
import { useTranslations } from 'next-intl';

export default function KinesiologiaPage() {
    const t = useTranslations('Services.kinesiologia');

    const benefits = [
        t('benefits.0'),
        t('benefits.1'),
        t('benefits.2'),
        t('benefits.3'),
        t('benefits.4'),
        t('benefits.5'),
    ];

    const features = [
        {
            title: t('features.1.title'),
            description: t('features.1.desc'),
        },
        {
            title: t('features.2.title'),
            description: t('features.2.desc'),
        },
        {
            title: t('features.3.title'),
            description: t('features.3.desc'),
        },
        {
            title: t('features.4.title'),
            description: t('features.4.desc'),
        },
    ];

    return (
        <ServiceDetail
            title={t('title')}
            subtitle={t('subtitle')}
            description={t('description')}
            imageSrc="/images/slider-info-1.png"
            benefits={benefits}
            features={features}
            price="$35.000"
            duration="45 - 60 min"
            color="teal-600"
            id="kine-musculo"
        />
    );
}
