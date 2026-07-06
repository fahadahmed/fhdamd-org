import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = import.meta.env.CLAIM_SECRET;
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface ClaimPayload {
  fileId: string;
  anonUid: string;
  expiresAt: number;
}

export function generateClaimToken(fileId: string, anonUid: string): string {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${fileId}:${anonUid}:${expiresAt}`;
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex');
  const encoded = Buffer.from(JSON.stringify({ fileId, anonUid, expiresAt })).toString('base64url');
  return `${encoded}.${hmac}`;
}

export function verifyClaimToken(token: string): ClaimPayload | null {
  try {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return null;

    const encoded = token.slice(0, dotIndex);
    const providedHmac = token.slice(dotIndex + 1);

    const parsed: ClaimPayload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    const { fileId, anonUid, expiresAt } = parsed;

    const expectedHmac = createHmac('sha256', SECRET)
      .update(`${fileId}:${anonUid}:${expiresAt}`)
      .digest('hex');

    const same = timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex'),
    );

    if (!same) return null;
    if (Date.now() > expiresAt) return null;

    return { fileId, anonUid, expiresAt };
  } catch {
    return null;
  }
}
