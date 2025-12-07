import nodemailer from 'nodemailer';

/**
 * Email service for sending invoice notifications
 */

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface SendInvoiceEmailParams {
    to: string;
    invoiceNumber: string;
    clientName: string;
    total: number;
    invoiceDate: Date;
    dueDate?: Date;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    subtotal: number;
    tax: number;
    pdfUrl?: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
    const {
        to,
        invoiceNumber,
        clientName,
        total,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        tax,
        pdfUrl,
    } = params;

    const formatCLP = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCLP(item.unitPrice)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCLP(item.subtotal)}</td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Diego Parra</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Kinesiología Integral</p>
                </div>

                <!-- Content -->
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #667eea; margin-top: 0;">Factura Electrónica</h2>
                    
                    <p>Estimado/a <strong>${clientName}</strong>,</p>
                    
                    <p>Se ha generado su factura electrónica. A continuación encontrará los detalles:</p>

                    <!-- Invoice Details -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0;"><strong>Número de Factura:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>Fecha de Emisión:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${invoiceDate.toLocaleDateString('es-CL')}</td>
                            </tr>
                            ${dueDate ? `
                            <tr>
                                <td style="padding: 8px 0;"><strong>Fecha de Vencimiento:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${dueDate.toLocaleDateString('es-CL')}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>

                    <!-- Items -->
                    <h3 style="color: #374151; margin-top: 30px;">Detalle de Servicios</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Descripción</th>
                                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Cant.</th>
                                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio Unit.</th>
                                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <div style="margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                        <table style="width: 100%; max-width: 300px; margin-left: auto;">
                            <tr>
                                <td style="padding: 8px 0;">Subtotal (Neto):</td>
                                <td style="padding: 8px 0; text-align: right; font-family: monospace;">${formatCLP(subtotal)}</td>
                            </tr>
                            <tr style="color: #059669;">
                                <td style="padding: 8px 0;">IVA (19%):</td>
                                <td style="padding: 8px 0; text-align: right; font-family: monospace;">+ ${formatCLP(tax)}</td>
                            </tr>
                            <tr style="border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: bold;">
                                <td style="padding: 12px 0 0 0;">TOTAL:</td>
                                <td style="padding: 12px 0 0 0; text-align: right; font-family: monospace; color: #667eea;">${formatCLP(total)}</td>
                            </tr>
                        </table>
                    </div>

                    ${pdfUrl ? `
                    <!-- Download Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${pdfUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                            📄 Descargar Comprobante PDF
                        </a>
                    </div>
                    ` : ''}

                    <!-- Footer Message -->
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        <p>Gracias por confiar en nuestros servicios.</p>
                        <p style="margin-bottom: 0;">Si tiene alguna consulta, no dude en contactarnos.</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>Diego Parra - Kinesiología Integral</p>
                    <p>Este es un correo automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: `"Diego Parra - Kinesiología" <${process.env.SMTP_USER}>`,
        to,
        subject: `Factura ${invoiceNumber} - Diego Parra Kinesiología`,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invoice email sent to ${to} for invoice ${invoiceNumber}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending invoice email:', error);
        throw error;
    }
}

export async function sendPaymentConfirmationEmail(params: {
    to: string;
    invoiceNumber: string;
    clientName: string;
    paymentAmount: number;
    paymentMethod: string;
    paymentDate: Date;
    remainingBalance: number;
}) {
    const {
        to,
        invoiceNumber,
        clientName,
        paymentAmount,
        paymentMethod,
        paymentDate,
        remainingBalance,
    } = params;

    const formatCLP = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    const methodLabels: Record<string, string> = {
        CASH: 'Efectivo',
        CARD: 'Tarjeta',
        TRANSFER: 'Transferencia',
        MERCADOPAGO: 'MercadoPago',
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">✓ Pago Recibido</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Diego Parra - Kinesiología Integral</p>
                </div>

                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <p>Estimado/a <strong>${clientName}</strong>,</p>
                    
                    <p>Hemos recibido su pago. Gracias por su confianza.</p>

                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0;"><strong>Factura:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>Monto Pagado:</strong></td>
                                <td style="padding: 8px 0; text-align: right; color: #10b981; font-size: 20px; font-weight: bold;">${formatCLP(paymentAmount)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>Método de Pago:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${methodLabels[paymentMethod] || paymentMethod}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;"><strong>Fecha:</strong></td>
                                <td style="padding: 8px 0; text-align: right;">${paymentDate.toLocaleDateString('es-CL')}</td>
                            </tr>
                            ${remainingBalance > 0 ? `
                            <tr style="border-top: 1px solid #d1fae5; padding-top: 8px;">
                                <td style="padding: 12px 0 0 0;"><strong>Saldo Pendiente:</strong></td>
                                <td style="padding: 12px 0 0 0; text-align: right; color: #f59e0b; font-weight: bold;">${formatCLP(remainingBalance)}</td>
                            </tr>
                            ` : `
                            <tr style="border-top: 1px solid #d1fae5;">
                                <td colspan="2" style="padding: 12px 0 0 0; text-align: center; color: #10b981; font-weight: bold;">
                                    ✓ Factura Pagada Completamente
                                </td>
                            </tr>
                            `}
                        </table>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        <p>Gracias por su pago.</p>
                        <p style="margin-bottom: 0;">Si tiene alguna consulta, no dude en contactarnos.</p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>Diego Parra - Kinesiología Integral</p>
                    <p>Este es un correo automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: `"Diego Parra - Kinesiología" <${process.env.SMTP_USER}>`,
        to,
        subject: `Confirmación de Pago - Factura ${invoiceNumber}`,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Payment confirmation email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        throw error;
    }
}
