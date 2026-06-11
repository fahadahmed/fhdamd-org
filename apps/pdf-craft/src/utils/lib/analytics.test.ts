import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted above variable declarations, so mocks that reference
// top-level variables must be created with vi.hoisted().
const { mockFirebaseLogEvent, mockFirebaseSetUserId, mockFirebaseSetUserProperties } = vi.hoisted(
  () => ({
    mockFirebaseLogEvent: vi.fn(),
    mockFirebaseSetUserId: vi.fn(),
    mockFirebaseSetUserProperties: vi.fn(),
  }),
);

vi.mock("firebase/analytics", () => ({
  logEvent: mockFirebaseLogEvent,
  setUserId: mockFirebaseSetUserId,
  setUserProperties: mockFirebaseSetUserProperties,
}));

let mockAnalytics: unknown = null;
vi.mock("../../firebase/client", () => ({
  get analytics() {
    return mockAnalytics;
  },
}));

import { logEvent, setUserId, setUserProperties } from "./analytics";

beforeEach(() => {
  vi.clearAllMocks();
  mockAnalytics = null;
});

describe("analytics — when analytics is not initialized", () => {
  it("logEvent returns early without calling firebase", () => {
    logEvent("test_event");
    expect(mockFirebaseLogEvent).not.toHaveBeenCalled();
  });

  it("setUserId returns early without calling firebase", () => {
    setUserId("user-123");
    expect(mockFirebaseSetUserId).not.toHaveBeenCalled();
  });

  it("setUserProperties returns early without calling firebase", () => {
    setUserProperties({ plan: "pro" });
    expect(mockFirebaseSetUserProperties).not.toHaveBeenCalled();
  });
});

describe("analytics — when analytics is initialized", () => {
  const fakeAnalytics = { app: {} };

  beforeEach(() => {
    mockAnalytics = fakeAnalytics;
  });

  it("logEvent calls firebaseLogEvent with event name and params", () => {
    logEvent("pdf_encrypted", { size: 100 });
    expect(mockFirebaseLogEvent).toHaveBeenCalledWith(fakeAnalytics, "pdf_encrypted", {
      size: 100,
    });
  });

  it("logEvent works without params", () => {
    logEvent("page_view");
    expect(mockFirebaseLogEvent).toHaveBeenCalledWith(fakeAnalytics, "page_view", undefined);
  });

  it("setUserId calls firebaseSetUserId", () => {
    setUserId("user-456");
    expect(mockFirebaseSetUserId).toHaveBeenCalledWith(fakeAnalytics, "user-456");
  });

  it("setUserProperties calls firebaseSetUserProperties", () => {
    setUserProperties({ plan: "free" });
    expect(mockFirebaseSetUserProperties).toHaveBeenCalledWith(fakeAnalytics, { plan: "free" });
  });
});
