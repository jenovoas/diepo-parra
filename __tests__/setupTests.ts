import '@testing-library/jest-dom';

import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request for API routes
class MockRequest {
  constructor(input, init) {
    this.url = input;
    this.init = init;
    // Add other properties as needed for your tests
  }
}

global.Request = MockRequest;

