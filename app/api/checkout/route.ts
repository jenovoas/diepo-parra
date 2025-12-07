import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

// Initialize MercadoPago with Access Token (Use Env Var in prod)
// robust-access-token-placeholder
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-4919106956263305-120615-55555555555555555555555555555555-123456789' });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items } = body;

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
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });

    } catch (error) {
        console.error("MercadoPago Error:", error);
        return NextResponse.json({ error: "Error creating preference" }, { status: 500 });
    }
}
