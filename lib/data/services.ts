import type { ElementType } from "react";
import {
    Activity,
    Sparkles,
    HeartHandshake,
    Home,
    Brain,
    Wind,
} from "lucide-react";

export interface ServiceData {
    id: string;
    slug: string;
    icon: ElementType;
    title: string;
    description: string;
    longDescription?: string;
    benefits?: string[];
    price: string;
    duration: string;
    color: string;
    bgColor: string;
    featured?: boolean;
}

export const services: ServiceData[] = [
    {
        id: "kine-musculo",
        slug: "kinesiologia",
        icon: Activity,
        title: "Kines. Musculoesquelética",
        description: "Rehabilitación avanzada para lesiones deportivas, traumatológicas, post-operatorios y dolores de espalda.",
        longDescription: "La Kinesiología Musculoesquelética se enfoca en la evaluación y tratamiento de disfunciones del sistema locomotor. Utilizamos técnicas manuales, ejercicio terapéutico y agentes físicos para aliviar el dolor, recuperar el rango de movimiento y fortalecer la musculatura afectada. Ideal para esguinces, desgarros, tendinitis, lumbagos y recuperación post-quirúrgica.",
        benefits: ["Alivio del dolor agudo y crónico", "Recuperación de la movilidad", "Fortalecimiento muscular específico", "Prevención de futuras lesiones"],
        price: "$60.000",
        duration: "50 min",
        color: "text-teal-600",
        bgColor: "bg-teal-50",
    },
    {
        id: "acupuntura-dolor",
        slug: "acupuntura",
        icon: Sparkles,
        title: "Acupuntura Dolor",
        description: "Tratamiento efectivo para lumbagos, ciática, tendinitis y dolores articulares crónicos.",
        longDescription: "La acupuntura es una técnica milenaria de la Medicina Tradicional China que consiste en la inserción de finas agujas en puntos específicos del cuerpo. En el manejo del dolor, la acupuntura estimula la liberación de endorfinas y modula la señal dolorosa, ofreciendo un alivio potente y natural sin efectos secundarios farmacológicos.",
        benefits: ["Manejo del dolor sin fármacos", "Reducción de la inflamación", "Mejora de la circulación local", "Efecto relajante muscular"],
        price: "$50.000",
        duration: "45 min",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    {
        id: "acupuntura-sm",
        slug: "acupuntura-salud-mental",
        icon: Brain,
        title: "Acupuntura Salud Mental",
        description: "Enfoque terapéutico para manejo de estrés, ansiedad, insomnio y migrañas recurrentes.",
        longDescription: "Más allá del dolor físico, la acupuntura es extremadamente efectiva para regular el sistema nervioso. Este tratamiento busca equilibrar el flujo energético (Qi) para calmar la mente, mejorar la calidad del sueño y reducir los niveles de estrés y ansiedad, promoviendo un estado de bienestar integral.",
        benefits: ["Reducción del estrés y ansiedad", "Mejora la calidad del sueño", "Equilibrio emocional", "Alivio de cefaleas tensionales"],
        price: "$50.000",
        duration: "45 min",
        color: "text-violet-600",
        bgColor: "bg-violet-50",
    },
    {
        id: "kine-respiratoria",
        slug: "kinesiologia-respiratoria",
        icon: Wind,
        title: "Kines. Respiratoria",
        description: "Manejo de patologías respiratorias (Asma, EPOC, Bronquitis) para adultos y niños. Limpieza bronquial.",
        longDescription: "Especialidad dedicada a la prevención, evaluación y tratamiento de alteraciones del sistema respiratorio. Mediante técnicas manuales y ejercicios respiratorios, ayudamos a eliminar secreciones, mejorar la ventilación pulmonar y optimizar la función respiratoria en pacientes con cuadros agudos (bronquitis, neumonía) o crónicos (Asma, EPOC).",
        benefits: ["Eliminación de secreciones", "Mejora de la capacidad pulmonar", "Alivio de la dificultad respiratoria", "Educación en uso de inhaladores"],
        price: "$50.000",
        duration: "40 min",
        color: "text-sky-600",
        bgColor: "bg-sky-50",
    },
    {
        id: "masaje",
        slug: "masaje-terapeutico",
        icon: HeartHandshake,
        title: "Masaje Terapéutico",
        description: "Técnicas manuales profundas para alivio de contracturas, descarga muscular y relajación.",
        longDescription: "El masaje terapéutico no es solo relajación; es una herramienta clínica para tratar tejidos blandos acortados o tensos. Utilizamos técnicas de masaje profundo, liberación miofascial y puntos gatillo para 'soltar' la musculatura, mejorar la irrigación sanguínea y proporcionar un alivio inmediato de la tensión acumulada.",
        benefits: ["Alivio de contracturas musculares", "Reducción del estrés físico", "Mejora de la circulación sanguínea", "Aumento de la flexibilidad"],
        price: "$55.000",
        duration: "60 min",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
    },

    {
        id: "kine-domicilio",
        slug: "kinesiologia-domicilio",
        icon: Home,
        title: "Kinesiología Domicilio",
        description: "Rehabilitación en tu hogar con equipamiento completo. Valdivia, Concepción y Curanilahue.",
        longDescription: "Llevamos la clínica a tu casa. Servicio ideal para pacientes post-operados de cadera/rodilla, personas mayores con dificultad de desplazamiento o simplemente para quienes prefieren la comodidad y seguridad de su hogar. Llevamos camilla, insumos y equipos de fisioterapia necesarios para una atención de calidad.",
        benefits: ["Comodidad y ahorro de tiempo", "Atención en entorno familiar", "Ideal para movilidad reducida", "Sin tiempos de espera"],
        price: "+$15.000",
        duration: "Adicional",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
    },
];
