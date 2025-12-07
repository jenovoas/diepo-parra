import * as nextAuth from 'next-auth';
import { GET } from '@/app/api/appointments/route';

jest.mock('next-auth');

// Mock next/server to control NextResponse behavior
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
    // Add other mocks for NextResponse methods if used in your route, e.g., redirect
  },
}));

// Mock Request and Response for this test file
class MockRequest {
  constructor(input, init) {
    this.url = input;
    this.init = init;
  }
}

class MockResponse {
  constructor(body, init) {
    this.body = body;
    this.init = init;
  }
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

global.Request = MockRequest;
global.Response = MockResponse;

describe('API /api/appointments', () => {
  it('debe rechazar sin sesión', async () => {
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
