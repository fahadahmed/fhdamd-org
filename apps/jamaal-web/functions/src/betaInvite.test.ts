import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MAX_AGE_MS,
  MIN_RESEND_MS,
  createBetaInvite,
  needsInvite,
  toMillis,
} from './betaInvite';
import type { BetaInviteDeps, InviteRecord } from './betaInvite';

const queuedAt = new Date('2026-10-25T00:00:00Z');
const minutes = (n: number) => new Date(queuedAt.getTime() + n * 60_000);
const ts = (date: Date) => ({ toMillis: () => date.getTime() });

function setup(
  record: InviteRecord | null = { firstName: ' Sam ', stage: 'testflight' },
  now = minutes(1),
  over: Partial<BetaInviteDeps> = {},
) {
  const deps = {
    signups: {
      get: vi.fn().mockResolvedValue(record),
      markSent: vi.fn().mockResolvedValue(undefined),
      recordFailure: vi.fn().mockResolvedValue(undefined),
    },
    send: vi.fn().mockResolvedValue(undefined),
    report: vi.fn().mockResolvedValue(undefined),
    now: () => now,
    ...over,
  } satisfies BetaInviteDeps;
  return { deps, handle: createBetaInvite(deps) };
}

const email = 'sam@example.com';

describe('toMillis', () => {
  it('reads a Timestamp, a Date, and nothing', () => {
    expect(toMillis(ts(queuedAt))).toBe(queuedAt.getTime());
    expect(toMillis(queuedAt)).toBe(queuedAt.getTime());
    expect(toMillis(undefined)).toBeNull();
    expect(toMillis('yesterday')).toBeNull();
  });
});

describe('needsInvite', () => {
  const now = minutes(5);

  it('invites someone who signed up in the beta', () => {
    expect(needsInvite({ stage: 'testflight' }, now)).toBe(true);
  });

  it('does not invite someone who signed up before the beta and has not asked', () => {
    expect(needsInvite({ stage: 'waitlist' }, now)).toBe(false);
    expect(needsInvite({}, now)).toBe(false);
  });

  it('invites someone from the waitlist who asked to join the beta', () => {
    expect(
      needsInvite({ stage: 'waitlist', inviteRequestedAt: ts(queuedAt) }, now),
    ).toBe(true);
  });

  it('never invites someone who unsubscribed or was given up on', () => {
    expect(
      needsInvite({ stage: 'testflight', unsubscribedAt: ts(queuedAt) }, now),
    ).toBe(false);
    expect(
      needsInvite({ stage: 'testflight', inviteFailedAt: ts(queuedAt) }, now),
    ).toBe(false);
  });

  it('does not send twice for the same request', () => {
    expect(
      needsInvite({ stage: 'testflight', inviteSentAt: ts(queuedAt) }, now),
    ).toBe(false);
    expect(
      needsInvite(
        {
          stage: 'waitlist',
          inviteRequestedAt: ts(queuedAt),
          inviteSentAt: ts(minutes(1)),
        },
        now,
      ),
    ).toBe(false);
  });

  it('sends again when they asked again after the last send, but not within the hour', () => {
    const sent = ts(queuedAt);
    const asked = ts(minutes(10));
    expect(
      needsInvite(
        { stage: 'testflight', inviteSentAt: sent, inviteRequestedAt: asked },
        minutes(30),
      ),
    ).toBe(false);
    expect(
      needsInvite(
        { stage: 'testflight', inviteSentAt: sent, inviteRequestedAt: asked },
        new Date(queuedAt.getTime() + MIN_RESEND_MS),
      ),
    ).toBe(true);
  });
});

describe('sending', () => {
  it('sends with the first name and records that it is done', async () => {
    const { deps, handle } = setup();
    expect(await handle(email, queuedAt)).toBe('sent');
    expect(deps.send).toHaveBeenCalledWith({
      email,
      firstName: 'Sam',
      idempotencyKey: 'beta-invite/sam@example.com/signup',
    });
    expect(deps.signups.markSent).toHaveBeenCalledWith(email);
  });

  it('keys a repeat request separately from the first send', async () => {
    const asked = new Date('2026-10-25T05:00:00Z');
    const { deps, handle } = setup(
      {
        stage: 'testflight',
        inviteSentAt: ts(queuedAt),
        inviteRequestedAt: ts(asked),
      },
      minutes(600),
    );
    await handle(email, queuedAt);
    expect(deps.send).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `beta-invite/sam@example.com/${asked.getTime()}`,
      }),
    );
  });

  it('sends to someone who gave no name', async () => {
    const { deps, handle } = setup({ stage: 'testflight' });
    await handle(email, queuedAt);
    expect(deps.send).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: '' }),
    );
  });

  it.each([
    ['has been removed since', null],
    [
      'has already been sent it',
      { stage: 'testflight', inviteSentAt: ts(queuedAt) },
    ],
    ['has unsubscribed', { stage: 'testflight', unsubscribedAt: ts(queuedAt) }],
    ['signed up before the beta', { stage: 'waitlist' }],
  ])('does nothing when the signup %s', async (_label, record) => {
    const { deps, handle } = setup(record as InviteRecord | null);
    expect(await handle(email, queuedAt)).toBe('skipped');
    expect(deps.send).not.toHaveBeenCalled();
    expect(deps.signups.markSent).not.toHaveBeenCalled();
  });
});

describe('failures', () => {
  const failing = {
    send: vi.fn().mockRejectedValue(new Error('Resend is down')),
  };

  it('throws while it is worth retrying, and does not mark the signup sent', async () => {
    const { deps, handle } = setup(undefined, minutes(60), failing);
    await expect(handle(email, queuedAt)).rejects.toThrow('Resend is down');
    expect(deps.signups.markSent).not.toHaveBeenCalled();
    expect(deps.signups.recordFailure).not.toHaveBeenCalled();
  });

  it('gives up after six hours: records it, reports it and stops', async () => {
    const { deps, handle } = setup(
      undefined,
      new Date(queuedAt.getTime() + DEFAULT_MAX_AGE_MS),
      failing,
    );
    expect(await handle(email, queuedAt)).toBe('gave-up');
    expect(deps.signups.recordFailure).toHaveBeenCalledWith({
      email,
      message: 'Resend is down',
      queuedAt,
    });
    expect(deps.report).toHaveBeenCalledOnce();
  });
});
