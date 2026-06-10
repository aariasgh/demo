import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Configure jest-dom matchers for Vitest
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
