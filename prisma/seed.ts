import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await hash('Admin123!', 12)

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@diepoparra.cl' },
        update: {},
        create: {
            email: 'admin@diepoparra.cl',
            name: 'Admin Diego Parra',
            passwordHash,
            role: 'ADMIN',
        },
    })

    console.log({ admin })

    // 2. Create Test Patient
    const patientUser = await prisma.user.upsert({
        where: { email: 'paciente@test.com' },
        update: {},
        create: {
            email: 'paciente@test.com',
            name: 'Paciente Test',
            passwordHash,
            role: 'USER',
        },
    })

    const patientProfile = await prisma.patient.upsert({
        where: { userId: patientUser.id },
        update: {},
        create: {
            userId: patientUser.id,
            fullName: 'Juan J. Paciente',
            birthDate: new Date('1990-01-01'),
            phone: '+56912345678',
            consentMedical: true,
            consentContact: true,
        },
    })

    console.log({ patientUser, patientProfile })

    // 3. Create Sample Appointments
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const appointment1 = await prisma.appointment.create({
        data: {
            date: tomorrow,
            serviceType: 'Kinesiología Musculoesquelética',
            status: 'PENDING',
            patientId: patientProfile.id,
            notes: 'Dolor lumbar crónico',
        },
    })

    console.log({ appointment1 })
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
