import * as nextAuth from 'next-auth';
import { GET } from '@/app/api/appointments/route';

jest.mock('next-auth');

describe('API /api/appointments', () => {
  it('debe rechazar sin sesión', async () => {
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
