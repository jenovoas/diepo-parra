import { PrismaClient } from '@prisma/client';

// Inline tax calculator to avoid import issues
function calculateServicePrice(basePrice: number) {
    const taxRate = 0.19;
    const taxAmount = Math.round(basePrice * taxRate);
    const finalPrice = basePrice + taxAmount;

    return {
        basePrice: Math.round(basePrice),
        taxRate,
        taxAmount: Math.round(taxAmount),
        finalPrice: Math.round(finalPrice),
    };
}

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding service prices...');

    const services = [
        {
            name: 'Kinesiología - Sesión Individual',
            description: 'Sesión de kinesiología individual de 45 minutos',
            category: 'KINESIOLOGIA',
            basePrice: 25000,
            durationMinutes: 45,
        },
        {
            name: 'Acupuntura - Sesión Individual',
            description: 'Sesión de acupuntura individual de 60 minutos',
            category: 'ACUPUNTURA',
            basePrice: 30000,
            durationMinutes: 60,
        },
        {
            name: 'Masaje Terapéutico',
            description: 'Masaje terapéutico de 60 minutos',
            category: 'MASAJES',
            basePrice: 28000,
            durationMinutes: 60,
        },
        {
            name: 'Evaluación Kinesiológica',
            description: 'Evaluación kinesiológica completa inicial',
            category: 'EVALUACION',
            basePrice: 20000,
            durationMinutes: 30,
        },
        {
            name: 'Terapia Manual',
            description: 'Sesión de terapia manual de 45 minutos',
            category: 'KINESIOLOGIA',
            basePrice: 27000,
            durationMinutes: 45,
        },
        {
            name: 'Electroestimulación',
            description: 'Sesión de electroestimulación de 30 minutos',
            category: 'KINESIOLOGIA',
            basePrice: 15000,
            durationMinutes: 30,
        },
        {
            name: 'Vendaje Neuromuscular',
            description: 'Aplicación de vendaje neuromuscular (kinesiotape)',
            category: 'KINESIOLOGIA',
            basePrice: 12000,
            durationMinutes: 20,
        },
        {
            name: 'Paquete 5 Sesiones Kinesiología',
            description: 'Paquete de 5 sesiones de kinesiología con descuento',
            category: 'KINESIOLOGIA',
            basePrice: 110000, // 22.000 por sesión (descuento de 12%)
            durationMinutes: 225, // 5 x 45 min
        },
        {
            name: 'Paquete 10 Sesiones Kinesiología',
            description: 'Paquete de 10 sesiones de kinesiología con descuento',
            category: 'KINESIOLOGIA',
            basePrice: 200000, // 20.000 por sesión (descuento de 20%)
            durationMinutes: 450, // 10 x 45 min
        },
        {
            name: 'Consulta Domiciliaria',
            description: 'Sesión a domicilio (incluye traslado)',
            category: 'OTHER',
            basePrice: 40000,
            durationMinutes: 60,
        },
    ];

    for (const service of services) {
        const pricing = calculateServicePrice(service.basePrice);

        const created = await prisma.servicePrice.upsert({
            where: { name: service.name },
            update: {
                description: service.description,
                category: service.category,
                basePrice: pricing.basePrice,
                taxRate: pricing.taxRate,
                taxAmount: pricing.taxAmount,
                finalPrice: pricing.finalPrice,
                durationMinutes: service.durationMinutes,
                isActive: true,
            },
            create: {
                name: service.name,
                description: service.description,
                category: service.category,
                basePrice: pricing.basePrice,
                taxRate: pricing.taxRate,
                taxAmount: pricing.taxAmount,
                finalPrice: pricing.finalPrice,
                durationMinutes: service.durationMinutes,
                isActive: true,
            },
        });

        console.log(`✅ ${created.name}: $${created.basePrice} + IVA = $${created.finalPrice}`);
    }

    console.log('✨ Service prices seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding service prices:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
