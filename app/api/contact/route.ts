
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message, phone, service, date } = body;

        // Validate required inputs
        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // HERE: Integrate with Email Service (SendGrid/Mailgun)
        // For now, we simulate success logging to console
        console.log("Contact Form Submitted:", { name, email, phone, service, date, message });

        // Optional: Save to database if we want to track leads
        // const lead = await prisma.lead.create(...)

        return NextResponse.json({ success: true, message: "Message received" });
    } catch (error) {
        console.error("Error processing contact form:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
