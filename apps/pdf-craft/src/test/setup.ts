import "@testing-library/jest-dom";

// IntersectionObserver is not implemented in jsdom — provide a stub class so
// components that use it (e.g. lazy canvas rendering) don't crash in tests.
class IntersectionObserverStub {
  observe(_target: Element): void { return }
  unobserve(_target: Element): void { return }
  disconnect(): void { return }
}
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

// HTMLCanvasElement.getContext is not implemented in jsdom
HTMLCanvasElement.prototype.getContext = () => null;
