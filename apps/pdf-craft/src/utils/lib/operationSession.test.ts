import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignInAnonymously = vi.fn();
vi.mock("firebase/auth", () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
}));

vi.mock("@sentry/astro", () => ({ captureException: vi.fn() }));

import { buildPrepareSession } from "./operationSession";
import { checkCredits, createAnonymousSession } from "../../test/mocks/astro-actions";
import { auth } from "../../firebase/client";

const mockIdToken = vi.fn().mockResolvedValue("anon-token");
const mockAnonUser = { uid: "anon-uid", isAnonymous: true, getIdToken: mockIdToken };

function makeConfig(overrides: Record<string, unknown> = {}) {
  return {
    isAuthenticated: true,
    creditCost: 2,
    defaultLabel: "Submit",
    setButtonLabel: vi.fn(),
    setError: vi.fn(),
    setProcessing: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as any).currentUser = { uid: "user-uid", isAnonymous: false };
  checkCredits.mockResolvedValue({ data: { success: true }, error: null });
  createAnonymousSession.mockResolvedValue({ data: { success: true }, error: null });
  mockSignInAnonymously.mockResolvedValue({ user: mockAnonUser });
});

describe("buildPrepareSession (authenticated path)", () => {
  it("calls checkCredits and returns true when credits are sufficient", async () => {
    const cfg = makeConfig();
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-encrypt", "req-1");
    expect(result).toBe(true);
    expect(checkCredits).toHaveBeenCalledWith({ task: "pdf-encrypt", requestId: "req-1", creditCost: 2 });
  });

  it("returns false and sets error when checkCredits fails", async () => {
    checkCredits.mockResolvedValue({ data: { success: false } });
    const cfg = makeConfig();
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-encrypt", "req-1");
    expect(result).toBe(false);
    expect(cfg.setError).toHaveBeenCalled();
    expect(cfg.setProcessing).toHaveBeenCalledWith(false);
  });
});

describe("buildPrepareSession (anonymous path)", () => {
  it("calls signInAnonymously and createAnonymousSession when not authenticated and no current user", async () => {
    (auth as any).currentUser = null;
    const cfg = makeConfig({ isAuthenticated: false });
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-merge", "req-2");
    expect(result).toBe(true);
    expect(mockSignInAnonymously).toHaveBeenCalled();
    expect(createAnonymousSession).toHaveBeenCalledWith({ idToken: "anon-token" });
    expect(checkCredits).not.toHaveBeenCalled();
  });

  it("skips signInAnonymously when already has currentUser (existing anon session)", async () => {
    (auth as any).currentUser = { uid: "anon-uid", isAnonymous: true };
    const cfg = makeConfig({ isAuthenticated: false });
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-merge", "req-2");
    expect(result).toBe(true);
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("returns false and sets error when createAnonymousSession fails", async () => {
    (auth as any).currentUser = null;
    createAnonymousSession.mockResolvedValue({ data: { success: false } });
    const cfg = makeConfig({ isAuthenticated: false });
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-merge", "req-2");
    expect(result).toBe(false);
    expect(cfg.setError).toHaveBeenCalledWith("Failed to start session. Please try again.");
    expect(cfg.setProcessing).toHaveBeenCalledWith(false);
  });

  it("returns false and sets error when signInAnonymously throws", async () => {
    (auth as any).currentUser = null;
    mockSignInAnonymously.mockRejectedValue(new Error("auth/operation-not-allowed"));
    const cfg = makeConfig({ isAuthenticated: false });
    const prepareSession = buildPrepareSession(cfg as any);
    const result = await prepareSession("pdf-merge", "req-2");
    expect(result).toBe(false);
    expect(cfg.setError).toHaveBeenCalledWith("Failed to start session. Please try again.");
  });
});
