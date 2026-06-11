import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("firebase-functions/logger", () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@sentry/astro", () => ({
  captureException: vi.fn(),
}));

import * as firebaseLogger from "firebase-functions/logger";
import * as Sentry from "@sentry/astro";
import { log } from "./logger";

beforeEach(() => vi.clearAllMocks());

describe("log", () => {
  it("debug calls firebase logger.debug with message and timestamp", () => {
    log.debug("debug msg", { requestId: "r1" });
    expect(firebaseLogger.debug).toHaveBeenCalledWith(
      "debug msg",
      expect.objectContaining({ requestId: "r1", timestamp: expect.any(String) }),
    );
  });

  it("info calls firebase logger.info", () => {
    log.info("info msg");
    expect(firebaseLogger.info).toHaveBeenCalledWith(
      "info msg",
      expect.objectContaining({ timestamp: expect.any(String) }),
    );
  });

  it("warn calls firebase logger.warn", () => {
    log.warn("warn msg");
    expect(firebaseLogger.warn).toHaveBeenCalledWith(
      "warn msg",
      expect.objectContaining({ timestamp: expect.any(String) }),
    );
  });

  it("error calls firebase logger.error", () => {
    log.error("error msg");
    expect(firebaseLogger.error).toHaveBeenCalledWith(
      "error msg",
      expect.objectContaining({ timestamp: expect.any(String) }),
    );
  });

  it("event calls logger.info with type='event'", () => {
    log.event("user_signed_up", { userId: "u1" });
    expect(firebaseLogger.info).toHaveBeenCalledWith(
      "user_signed_up",
      expect.objectContaining({ type: "event", userId: "u1" }),
    );
  });

  it("business calls logger.info with type='business'", () => {
    log.business("pdf_encrypted", { feature: "encrypt" });
    expect(firebaseLogger.info).toHaveBeenCalledWith(
      "pdf_encrypted",
      expect.objectContaining({ type: "business", feature: "encrypt" }),
    );
  });

  it("exception calls logger.error with error details and Sentry.captureException", () => {
    const err = new Error("boom");
    log.exception(err, { feature: "decrypt" });

    expect(firebaseLogger.error).toHaveBeenCalledWith(
      "exception",
      expect.objectContaining({
        type: "error",
        error: "boom",
        feature: "decrypt",
        stack: expect.any(String),
      }),
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      extra: { feature: "decrypt" },
    });
  });

  it("exception works without optional context", () => {
    const err = new Error("no ctx");
    log.exception(err);
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { extra: undefined });
  });
});
