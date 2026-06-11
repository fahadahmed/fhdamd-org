import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useRecaptcha from "./useRecaptcha";

const mockExecute = vi.fn();
const mockReady = vi.fn((cb: () => void) => cb());

beforeEach(() => {
  vi.stubGlobal("grecaptcha", { ready: mockReady, execute: mockExecute });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useRecaptcha", () => {
  it("returns null when grecaptcha is not available", async () => {
    vi.stubGlobal("grecaptcha", undefined);

    const { result } = renderHook(() => useRecaptcha("submit"));

    let token: string | null = "initial";
    await act(async () => {
      token = await result.current.getToken();
    });

    expect(token).toBeNull();
  });

  it("calls grecaptcha.execute with the action and returns the token", async () => {
    mockExecute.mockResolvedValue("mock-token-abc");

    const { result } = renderHook(() => useRecaptcha("login"));

    let token: string | null = null;
    await act(async () => {
      token = await result.current.getToken();
    });

    expect(mockReady).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledWith("test-site-key", { action: "login" });
    expect(token).toBe("mock-token-abc");
  });

  it("returns null when grecaptcha.execute throws", async () => {
    mockExecute.mockRejectedValue(new Error("network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useRecaptcha("submit"));

    let token: string | null = "initial";
    await act(async () => {
      token = await result.current.getToken();
    });

    expect(token).toBeNull();
    consoleSpy.mockRestore();
  });

  it("uses the latest action even after the hook re-renders", async () => {
    mockExecute.mockResolvedValue("token");
    const { result, rerender } = renderHook(({ action }) => useRecaptcha(action), {
      initialProps: { action: "first-action" },
    });

    rerender({ action: "updated-action" });

    await act(async () => {
      await result.current.getToken();
    });

    expect(mockExecute).toHaveBeenCalledWith("test-site-key", { action: "updated-action" });
  });
});
