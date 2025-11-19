import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock window.matchMedia for WordPress components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for WordPress components
globalThis.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;

// Mock Prism.js for syntax highlighting
vi.mock("prismjs", () => ({
  default: {
    highlightElement: vi.fn(),
  },
}));

vi.mock("prismjs/components/prism-javascript", () => ({}));
vi.mock("prismjs/themes/prism.css", () => ({}));

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});
