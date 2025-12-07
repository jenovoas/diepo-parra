/**
 * Tax Calculator for Chilean Tax System
 * IVA: 19% (Impuesto al Valor Agregado)
 * 
 * Complies with:
 * - Decreto Ley N° 825 (Ley del IVA)
 * - Resoluciones SII sobre redondeo
 */

const IVA_RATE = 0.19; // 19%
const IVA_DIVISOR = 1.19; // Para calcular neto desde total

/**
 * Calculate IVA (19%) from net amount
 */
export function calculateIVA(neto: number): number {
    return Math.round(neto * IVA_RATE);
}

/**
 * Calculate total (neto + IVA)
 */
export function calculateTotal(neto: number): number {
    const iva = calculateIVA(neto);
    return neto + iva;
}

/**
 * Calculate net amount from total (reverse calculation)
 */
export function calculateNeto(total: number): number {
    return Math.round(total / IVA_DIVISOR);
}

/**
 * Calculate IVA from total (reverse calculation)
 */
export function calculateIVAFromTotal(total: number): number {
    const neto = calculateNeto(total);
    return total - neto;
}

/**
 * Round amount according to SII rules
 * Chilean peso doesn't have decimals, so we round to nearest integer
 */
export function roundAmount(amount: number): number {
    return Math.round(amount);
}

/**
 * Calculate line item subtotal
 */
export function calculateLineSubtotal(
    quantity: number,
    unitPrice: number,
    discount: number = 0
): number {
    const subtotal = (quantity * unitPrice) - discount;
    return roundAmount(subtotal);
}

/**
 * Calculate invoice totals
 */
export interface InvoiceTotals {
    subtotal: number;  // Neto
    tax: number;       // IVA
    total: number;     // Total
}

export function calculateInvoiceTotals(
    items: Array<{ quantity: number; unitPrice: number; discount?: number }>
): InvoiceTotals {
    // Calculate subtotal (sum of all line items)
    const subtotal = items.reduce((sum, item) => {
        return sum + calculateLineSubtotal(
            item.quantity,
            item.unitPrice,
            item.discount || 0
        );
    }, 0);

    // Calculate IVA
    const tax = calculateIVA(subtotal);

    // Calculate total
    const total = subtotal + tax;

    return {
        subtotal: roundAmount(subtotal),
        tax: roundAmount(tax),
        total: roundAmount(total),
    };
}

/**
 * Validate RUT (Chilean tax ID)
 * Format: 12.345.678-9 or 12345678-9
 */
export function validateRUT(rut: string): boolean {
    // Remove dots and hyphens
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');

    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Calculate verification digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedDV = 11 - (sum % 11);
    const expectedDV = calculatedDV === 11 ? '0' : calculatedDV === 10 ? 'K' : calculatedDV.toString();

    return dv === expectedDV;
}

/**
 * Format RUT with dots and hyphen
 * 12345678-9 => 12.345.678-9
 */
export function formatRUT(rut: string): string {
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Add dots every 3 digits from right to left
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${dv}`;
}

/**
 * Format amount as Chilean peso
 */
export function formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calculate service price with tax
 */
export interface ServicePriceCalculation {
    basePrice: number;
    taxRate: number;
    taxAmount: number;
    finalPrice: number;
}

export function calculateServicePrice(basePrice: number, taxRate: number = IVA_RATE): ServicePriceCalculation {
    const taxAmount = calculateIVA(basePrice);
    const finalPrice = basePrice + taxAmount;

    return {
        basePrice: roundAmount(basePrice),
        taxRate,
        taxAmount: roundAmount(taxAmount),
        finalPrice: roundAmount(finalPrice),
    };
}
