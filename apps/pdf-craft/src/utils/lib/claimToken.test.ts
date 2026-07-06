import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateClaimToken, verifyClaimToken } from "./claimToken";

describe("claimToken", () => {
  describe("generateClaimToken", () => {
    it("returns a non-empty string", () => {
      const token = generateClaimToken("file-123", "anon-uid-456");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("contains two dot-separated parts (encoded payload + HMAC)", () => {
      const token = generateClaimToken("file-123", "anon-uid-456");
      const parts = token.split(".");
      expect(parts).toHaveLength(2);
    });

    it("produces different tokens for different fileIds", () => {
      const t1 = generateClaimToken("file-aaa", "anon-uid");
      const t2 = generateClaimToken("file-bbb", "anon-uid");
      expect(t1).not.toBe(t2);
    });

    it("produces different tokens for different anonUids", () => {
      const t1 = generateClaimToken("file-123", "anon-uid-aaa");
      const t2 = generateClaimToken("file-123", "anon-uid-bbb");
      expect(t1).not.toBe(t2);
    });
  });

  describe("verifyClaimToken", () => {
    it("returns the correct payload for a freshly generated token", () => {
      const token = generateClaimToken("file-abc", "anon-xyz");
      const payload = verifyClaimToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.fileId).toBe("file-abc");
      expect(payload!.anonUid).toBe("anon-xyz");
      expect(payload!.expiresAt).toBeGreaterThan(Date.now());
    });

    it("returns null for an empty string", () => {
      expect(verifyClaimToken("")).toBeNull();
    });

    it("returns null for a token with no dot separator", () => {
      expect(verifyClaimToken("nodotsinhere")).toBeNull();
    });

    it("returns null when the HMAC has been tampered with", () => {
      const token = generateClaimToken("file-abc", "anon-xyz");
      const tampered = token.slice(0, -4) + "0000";
      expect(verifyClaimToken(tampered)).toBeNull();
    });

    it("returns null when the payload has been tampered with", () => {
      const token = generateClaimToken("file-abc", "anon-xyz");
      const [, hmac] = token.split(".");
      const fakePayload = Buffer.from(JSON.stringify({ fileId: "evil", anonUid: "evil", expiresAt: Date.now() + 9999 })).toString("base64url");
      expect(verifyClaimToken(`${fakePayload}.${hmac}`)).toBeNull();
    });

    it("returns null for an expired token", () => {
      const token = generateClaimToken("file-abc", "anon-xyz");
      // Advance time by 31 minutes (TTL is 30 min)
      const realDateNow = Date.now;
      vi.spyOn(Date, "now").mockReturnValue(realDateNow() + 31 * 60 * 1000);
      expect(verifyClaimToken(token)).toBeNull();
      vi.restoreAllMocks();
    });

    it("returns null for malformed base64url payload", () => {
      expect(verifyClaimToken("!!!invalid-base64.abc123")).toBeNull();
    });
  });
});
