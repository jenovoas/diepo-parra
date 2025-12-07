import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Initialize MercadoPago with Access Token
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || 'TEST-token'
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { items, serviceIds } = body;

        // Get patient ID if user is logged in
        let patientId = null;
        let clientEmail = null;

        if (session?.user) {
            const patient = await prisma.patient.findFirst({
                where: { userId: session.user.id as string },
                include: { user: true },
            });

            if (patient) {
                patientId = patient.id;
                clientEmail = patient.user?.email;
            }
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: items,
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/pending`,
                },
                auto_return: "approved",
                metadata: {
                    patient_id: patientId,
                    service_ids: JSON.stringify(serviceIds || []),
                    email: clientEmail,
                },
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });

    } catch (error) {
        console.error("MercadoPago Error:", error);
        return NextResponse.json({ error: "Error creating preference" }, { status: 500 });
    }
}
