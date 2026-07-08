import { vi } from "vitest";

// Named exports so tests can import and reconfigure these directly.
export const checkCredits = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const mergePdfs = vi.fn().mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/merged.pdf" } }, error: null });
export const encryptPdf = vi.fn().mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/encrypted.pdf" } }, error: null });
export const decryptPdf = vi.fn().mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/decrypted.pdf" } }, error: null });
export const imageToPdf = vi.fn().mockResolvedValue({ data: { data: { fileUrl: "https://cdn.test/output.pdf" } }, error: null });
export const splitPdf = vi.fn().mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/split.pdf" } }, error: null });
export const compressPdf = vi.fn().mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/compressed.pdf", alreadyOptimised: false } }, error: null });
export const signPdf = vi.fn().mockResolvedValue({ data: { success: true, data: { fileUrl: "https://cdn.test/signed.pdf" } }, error: null });
export const verifyUser = vi.fn().mockResolvedValue({ data: { redirected: false }, error: null });
export const createUser = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const signOutUser = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const sendPasswordReset = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const sendMessage = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const createAnonymousSession = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const finalizeLinkedUser = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const migrateFile = vi.fn().mockResolvedValue({ data: { success: true }, error: null });
export const claimFile = vi.fn().mockResolvedValue({ data: { success: true, payload: { downloadUrl: "https://cdn.test/claimed.pdf" } }, error: null });

export const actions = {
  credits: { checkCredits },
  operations: { mergePdfs, encryptPdf, decryptPdf, imageToPdf, splitPdf, compressPdf, signPdf },
  user: { verifyUser, createUser, signOutUser, sendPasswordReset, createAnonymousSession, finalizeLinkedUser },
  contact: { sendMessage },
  claims: { migrateFile, claimFile },
};

export const defineAction = vi.fn((config: unknown) => config);
