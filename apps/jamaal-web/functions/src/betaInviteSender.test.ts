import { describe, expect, it, vi } from 'vitest';
import { BETA_INVITE_SUBJECT } from './betaInviteEmail';
import { createInviteSender } from './betaInviteSender';
import type { ResendEmails } from './betaInviteSender';

const options = {
  from: 'Jamaal <support@jamaal.app>',
  replyTo: 'support@jamaal.app',
  testflightUrl: 'https://testflight.apple.com/join/b7s4hW6F',
  siteUrl: 'https://jamaal.app',
  unsubscribeUrl: 'mailto:support@jamaal.app?subject=Unsubscribe',
};

const fake = (
  result: { error: { message: string } | null } = { error: null },
) => {
  const send = vi.fn().mockResolvedValue(result);
  return { send, resend: { emails: { send } } as unknown as ResendEmails };
};

describe('createInviteSender', () => {
  it('sends the designed email, in HTML and plain text, with the link and the idempotency key', async () => {
    const { send, resend } = fake();
    await createInviteSender(
      resend,
      options,
    )({ email: 'sam@example.com', firstName: 'Sam', idempotencyKey: 'k1' });

    const [payload, requestOptions] = send.mock.calls[0];
    expect(requestOptions).toEqual({ idempotencyKey: 'k1' });
    expect(payload).toMatchObject({
      from: options.from,
      to: 'sam@example.com',
      replyTo: 'support@jamaal.app',
      subject: BETA_INVITE_SUBJECT,
    });
    expect(payload.html).toContain('Hi Sam,');
    expect(payload.html).toContain(`href="${options.testflightUrl}"`);
    expect(payload.html).toContain('https://jamaal.app/email/jamaal-icon.png');
    expect(payload.text).toContain(
      `Install the beta: ${options.testflightUrl}`,
    );
    expect(payload.html).not.toContain('{{');
    expect(payload.text).not.toContain('{{');
  });

  it("greets someone with no name as 'there', and escapes a name with markup in it", async () => {
    const { send, resend } = fake();
    const sender = createInviteSender(resend, options);
    await sender({ email: 'a@b.co', firstName: '', idempotencyKey: 'k' });
    await sender({
      email: 'a@b.co',
      firstName: '<b>Sam</b>',
      idempotencyKey: 'k',
    });
    expect(send.mock.calls[0][0].html).toContain('Hi there,');
    expect(send.mock.calls[1][0].html).toContain('Hi &lt;b&gt;Sam&lt;/b&gt;,');
    expect(send.mock.calls[1][0].html).not.toContain('<b>Sam</b>');
  });

  it('only links to journal articles that exist', async () => {
    const { send, resend } = fake();
    await createInviteSender(
      resend,
      options,
    )({ email: 'a@b.co', firstName: '', idempotencyKey: 'k' });
    const slugs = [
      ...send.mock.calls[0][0].html.matchAll(/\/journal\/([a-z-]+)\?/g),
    ].map((m) => m[1]);
    const published = [
      'salah-quran-dhikr',
      'first-night-planning',
      'why-i-built-jamaal',
      'your-day-on-one-list',
      'anchors-the-things-your-day-moves-around',
    ];
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(published).toContain(slug);
  });

  it('throws when Resend refuses, so the caller retries', async () => {
    const { resend } = fake({ error: { message: 'rate limited' } });
    await expect(
      createInviteSender(
        resend,
        options,
      )({ email: 'a@b.co', firstName: '', idempotencyKey: 'k' }),
    ).rejects.toThrow('rate limited');
  });
});
