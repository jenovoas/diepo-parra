import { getAppointmentsForUser } from '@/lib/appointments';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn().mockResolvedValue([{ id: '1', serviceType: 'Kine', patient: { id: 'p1' } }]),
    },
    patient: {
      findUnique: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }),
    },
  },
}));

describe('getAppointmentsForUser', () => {
  it('devuelve citas para admin', async () => {
    const session = { user: { id: 'admin', email: 'a@a.com', role: 'ADMIN' } };
    const result = await getAppointmentsForUser(session);
    expect(result).toEqual([{ id: '1', serviceType: 'Kine', patient: { id: 'p1' } }]);
  });

  it('devuelve citas para usuario paciente', async () => {
    const session = { user: { id: 'u1', email: 'p@p.com', role: 'USER' } };
    const result = await getAppointmentsForUser(session);
    expect(result).toEqual([{ id: '1', serviceType: 'Kine', patient: { id: 'p1' } }]);
  });

  it('devuelve [] si el paciente no existe', async () => {
    const { prisma } = require('@/lib/prisma');
    prisma.patient.findUnique.mockResolvedValueOnce(null);
    const session = { user: { id: 'u2', email: 'x@x.com', role: 'USER' } };
    const result = await getAppointmentsForUser(session);
    expect(result).toEqual([]);
  });
});
