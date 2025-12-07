import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await hash('Admin123!', 12)

    // 1. Create Roles & Specific Users
    const roles = [
        { email: 'admin@diepoparra.cl', name: 'Admin Diego Parra', role: 'ADMIN', image: 'https://i.pravatar.cc/150?u=admin@diepoparra.cl' },
        { email: 'medico@diepoparra.cl', name: 'Dr. Roberto Médico', role: 'DOCTOR', image: 'https://i.pravatar.cc/150?u=medico@diepoparra.cl' },
        { email: 'asistente@diepoparra.cl', name: 'Asistente Clínica', role: 'ASSISTANT', image: 'https://i.pravatar.cc/150?u=asistente@diepoparra.cl' },
        { email: 'paciente@test.com', name: 'Paciente Test', role: 'USER', image: 'https://i.pravatar.cc/150?u=paciente@test.com' },
    ];

    for (const user of roles) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: { role: user.role, image: user.image },
            create: {
                email: user.email,
                name: user.name,
                passwordHash,
                role: user.role,
                image: user.image,
            },
        });
    }

    // 2. Create Patient Profile for the Test Patient
    const testUser = await prisma.user.findUnique({ where: { email: 'paciente@test.com' } });
    if (testUser) {
        await prisma.patient.upsert({
            where: { userId: testUser.id },
            update: {},
            create: {
                userId: testUser.id,
                fullName: 'Juan J. Paciente',
                birthDate: new Date('1990-01-01'),
                phone: '+56912345678',
                consentMedical: true,
                consentContact: true,
                anamnesis: "Dolor lumbar persistente.",
                diagnosis: "Lumbago crónico",
                occupation: "Ingeniero",
                address: "Calle Falsa 123"
            },
        });
    }

    // 3. Generate 20 Dummy Patients
    const firstNames = ["Ana", "Carlos", "Beatriz", "David", "Elena", "Fernando", "Gabriela", "Hugo", "Isabel", "Javier"];
    const lastNames = ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva", "Martínez", "Sepúlveda"];

    for (let i = 0; i < 20; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const email = `paciente${i + 1}@example.com`;

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: fullName,
                passwordHash,
                role: 'USER',
                image: `https://i.pravatar.cc/150?u=${email}`
            },
        });

        await prisma.patient.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                fullName,
                birthDate: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                phone: `+569${Math.floor(Math.random() * 90000000) + 10000000}`,
                occupation: ["Profesor", "Ingeniero", "Estudiante", "Jubilado", "Vendedor"][Math.floor(Math.random() * 5)],
                address: "Dirección de prueba " + i,
                anamnesis: "Molestias generales.",
                diagnosis: Math.random() > 0.5 ? "Contractura muscular" : "Tendinopatía",
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past date
            },
        });

        // Randomly assign appointments to some patients
        if (Math.random() > 0.5) {
            const today = new Date();
            const aptDate = new Date(today);
            aptDate.setDate(today.getDate() + Math.floor(Math.random() * 14));
            aptDate.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0);

            // We need the patient record ID
            const patientRecord = await prisma.patient.findUnique({ where: { userId: user.id } });

            if (patientRecord) {
                await prisma.appointment.create({
                    data: {
                        date: aptDate,
                        serviceType: ['Kinesiología', 'Acupuntura', 'Masoterapia'][Math.floor(Math.random() * 3)],
                        status: ['PENDING', 'CONFIRMED'][Math.floor(Math.random() * 2)],
                        patientId: patientRecord.id,
                    }
                });
            }
        }
    }

    console.log("Database seeded successfully with roles and 20+ patients.");
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
