import "@testing-library/jest-dom";

// IntersectionObserver is not implemented in jsdom — provide a no-op stub so
// components that use it (e.g. lazy canvas rendering) don't crash in tests.
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

// HTMLCanvasElement.getContext is not implemented in jsdom
HTMLCanvasElement.prototype.getContext = () => null;
