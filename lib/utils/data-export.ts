import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { prisma } from '@/lib/prisma';
import { decrypt } from './encryption';

/**
 * PDF Export Utility
 * Generates comprehensive PDF of patient medical record
 * Complies with Ley 19.628 (Derecho de Portabilidad)
 */

export interface PatientExportData {
    includeAppointments?: boolean;
    includeMedications?: boolean;
    includeTreatments?: boolean;
    includeMetrics?: boolean;
}

/**
 * Generate PDF of patient medical record
 */
export async function generatePatientPDF(patientId: string, options: PatientExportData = {}) {
    const {
        includeAppointments = true,
        includeMedications = true,
        includeTreatments = true,
        includeMetrics = true,
    } = options;

    // Fetch complete patient data
    const patient = (await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            user: true,
            appointments: includeAppointments,
            medications: includeMedications,
            treatments: includeTreatments,
            healthMetrics: includeMetrics,
        },
    })) as any;

    if (!patient) {
        throw new Error('Patient not found');
    }

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166); // Primary color
    doc.text('FICHA CLÍNICA ELECTRÓNICA', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Diego Parra - Kinesiología y Acupuntura', 105, yPosition, { align: 'center' });

    yPosition += 15;

    // Patient Info Section
    doc.setFontSize(14);
    doc.setTextColor(40, 116, 166);
    doc.text('DATOS DEL PACIENTE', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0);

    const personalData = [
        ['Nombre Completo', patient.fullName],
        ['Email', patient.user?.email || 'N/A'],
        ['Teléfono', patient.phone || 'N/A'],
        ['Fecha de Nacimiento', new Date(patient.birthDate).toLocaleDateString('es-CL')],
        ['Edad', calculateAge(patient.birthDate) + ' años'],
        ['Género', patient.gender || 'N/A'],
        ['Ocupación', patient.occupation || 'N/A'],
        ['Dirección', patient.address || 'N/A'],
        ['Tipo de Sangre', patient.bloodType || 'N/A'],
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: personalData,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 130 },
        },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Medical History Section
    if (patient.condition || patient.anamnesis || patient.diagnosis) {
        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('HISTORIA CLÍNICA', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setTextColor(0);

        const medicalData = [];

        if (patient.allergies) {
            try {
                const allergies = JSON.parse(decrypt(patient.allergies));
                medicalData.push(['Alergias', allergies.join(', ')]);
            } catch {
                medicalData.push(['Alergias', patient.allergies]);
            }
        }

        if (patient.chronicConditions) {
            try {
                const conditions = JSON.parse(decrypt(patient.chronicConditions));
                medicalData.push(['Condiciones Crónicas', conditions.join(', ')]);
            } catch {
                medicalData.push(['Condiciones Crónicas', patient.chronicConditions]);
            }
        }

        if (patient.condition) {
            medicalData.push(['Condición Actual', decrypt(patient.condition)]);
        }

        if (patient.anamnesis) {
            medicalData.push(['Anamnesis', decrypt(patient.anamnesis)]);
        }

        if (patient.surgicalHistory) {
            medicalData.push(['Antecedentes Quirúrgicos', decrypt(patient.surgicalHistory)]);
        }

        if (patient.pathologicalHistory) {
            medicalData.push(['Antecedentes Patológicos', decrypt(patient.pathologicalHistory)]);
        }

        if (patient.diagnosis) {
            medicalData.push(['Diagnóstico', decrypt(patient.diagnosis)]);
        }

        if (patient.treatmentPlan) {
            medicalData.push(['Plan de Tratamiento', decrypt(patient.treatmentPlan)]);
        }

        autoTable(doc, {
            startY: yPosition,
            body: medicalData,
            theme: 'plain',
            styles: { fontSize: 9 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 50 },
                1: { cellWidth: 130 },
            },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Medications Section
    if (includeMedications && patient.medications && patient.medications.length > 0) {
        checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('MEDICAMENTOS', 14, yPosition);
        yPosition += 8;

        const medicationData = patient.medications.map((med: any) => [
            med.name,
            med.dosage || 'N/A',
            med.frequency || 'N/A',
            med.isActive ? 'Activo' : 'Inactivo',
            new Date(med.startDate).toLocaleDateString('es-CL'),
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Medicamento', 'Dosis', 'Frecuencia', 'Estado', 'Inicio']],
            body: medicationData,
            theme: 'striped',
            headStyles: { fillColor: [40, 116, 166] },
            styles: { fontSize: 9 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Treatments Section
    if (includeTreatments && patient.treatments && patient.treatments.length > 0) {
        checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('TRATAMIENTOS', 14, yPosition);
        yPosition += 8;

        const treatmentData = patient.treatments.map((treatment: any) => [
            treatment.type.replace(/_/g, ' '),
            treatment.provider || 'N/A',
            treatment.frequency || 'N/A',
            treatment.isActive ? 'En Curso' : 'Finalizado',
            new Date(treatment.startDate).toLocaleDateString('es-CL'),
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Tipo', 'Proveedor', 'Frecuencia', 'Estado', 'Inicio']],
            body: treatmentData,
            theme: 'striped',
            headStyles: { fillColor: [40, 116, 166] },
            styles: { fontSize: 9 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Health Metrics Summary
    if (includeMetrics && patient.healthMetrics && patient.healthMetrics.length > 0) {
        checkPageBreak(doc, yPosition, 40);

        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('MÉTRICAS DE SALUD (Últimos 10 registros)', 14, yPosition);
        yPosition += 8;

        const metricsData = patient.healthMetrics
            .slice(0, 10)
            .map((metric: any) => [
                metric.type.replace(/_/g, ' '),
                `${metric.value} ${metric.unit}`,
                metric.source.replace(/_/g, ' '),
                new Date(metric.recordedAt).toLocaleDateString('es-CL'),
            ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Tipo', 'Valor', 'Fuente', 'Fecha']],
            body: metricsData,
            theme: 'striped',
            headStyles: { fillColor: [40, 116, 166] },
            styles: { fontSize: 9 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
        doc.text(
            `Generado el ${new Date().toLocaleString('es-CL')}`,
            14,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            'Documento Confidencial',
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }

    return doc;
}

/**
 * Helper: Calculate age from birthdate
 */
function calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Helper: Check if new page is needed
 */
function checkPageBreak(doc: jsPDF, yPosition: number, requiredSpace: number) {
    if (yPosition + requiredSpace > doc.internal.pageSize.height - 20) {
        doc.addPage();
        return 20;
    }
    return yPosition;
}

/**
 * Generate JSON export of patient data
 */
export async function generatePatientJSON(patientId: string) {
    const patient = (await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
            appointments: true,
            medications: true,
            treatments: true,
            healthMetrics: true,
            deviceConnections: {
                select: {
                    provider: true,
                    lastSync: true,
                    isActive: true,
                },
            },
        },
    })) as any;

    if (!patient) {
        throw new Error('Patient not found');
    }

    // Decrypt sensitive fields
    const decryptedPatient = {
        ...patient,
        condition: patient.condition ? decrypt(patient.condition) : null,
        anamnesis: patient.anamnesis ? decrypt(patient.anamnesis) : null,
        surgicalHistory: patient.surgicalHistory ? decrypt(patient.surgicalHistory) : null,
        pathologicalHistory: patient.pathologicalHistory ? decrypt(patient.pathologicalHistory) : null,
        diagnosis: patient.diagnosis ? decrypt(patient.diagnosis) : null,
        treatmentPlan: patient.treatmentPlan ? decrypt(patient.treatmentPlan) : null,
        evolutionNotes: patient.evolutionNotes ? decrypt(patient.evolutionNotes) : null,
        allergies: patient.allergies ? JSON.parse(decrypt(patient.allergies)) : null,
        chronicConditions: patient.chronicConditions ? JSON.parse(decrypt(patient.chronicConditions)) : null,
        emergencyContact: patient.emergencyContact ? JSON.parse(decrypt(patient.emergencyContact)) : null,
        insuranceInfo: patient.insuranceInfo ? JSON.parse(decrypt(patient.insuranceInfo)) : null,
    };

    return {
        exportDate: new Date().toISOString(),
        patient: decryptedPatient,
        metadata: {
            totalAppointments: patient.appointments?.length || 0,
            totalMedications: patient.medications?.length || 0,
            totalTreatments: patient.treatments?.length || 0,
            totalMetrics: patient.healthMetrics?.length || 0,
        },
    };
}
