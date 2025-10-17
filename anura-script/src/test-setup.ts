import { beforeEach, vi } from 'vitest';

// Mock window.Anura global object
beforeEach(() => {
  // Reset document
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock window.Anura
  (window as any).Anura = {
    getAnura: vi.fn(() => ({
      getId: vi.fn(() => 'test-visitor-id'),
      result: 'good',
    })),
  };

  // Mock window.gtag
  (window as any).gtag = undefined;
  (window as any).dataLayer = [];
});
