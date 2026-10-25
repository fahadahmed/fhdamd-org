/**
 * The beta invite email: the TestFlight public link, sent to someone who signed up for the beta.
 * The HTML is the owner's design (table layout, inline styles, light only); only the values below are filled in.
 */

export interface BetaInviteEmailInput {
  firstName: string;
  /** The TestFlight public link. */
  testflightUrl: string;
  /** The site's origin, no trailing slash. */
  siteUrl: string;
  unsubscribeUrl: string;
}

export const BETA_INVITE_SUBJECT = 'Your Jamaal beta link';

export const BETA_INVITE_INTRO =
  'Thanks for signing up. The Jamaal beta is open on iPhone, iPad and Mac, and this is your link to install it.';

const esc = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const greetingFor = (firstName: string): string => firstName.trim() || 'there';

export function betaInviteHtml({
  firstName,
  testflightUrl,
  siteUrl,
  unsubscribeUrl,
}: BetaInviteEmailInput): string {
  const greeting = greetingFor(firstName);
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Your Jamaal beta link</title>
<style>
  body{margin:0;padding:0;background:#EFF4F0;}
  table{border-collapse:collapse;}
  img{border:0;}
  a{color:#1F6A58;}
  @media only screen and (max-width:620px){
    .wrap{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .h1{font-size:30px !important;line-height:1.15 !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#EFF4F0;">
<!-- Preheader: shows in the inbox list -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EFF4F0;font-size:1px;line-height:1px;">Install the beta with TestFlight in about two minutes.&#8199;&zwnj;&#8199;&zwnj;&#8199;&zwnj;&#8199;&zwnj;&#8199;&zwnj;&#8199;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EFF4F0" style="background:#EFF4F0;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Header -->
    <tr><td bgcolor="#0C4767" class="px" style="background:#0C4767;border-radius:20px 20px 0 0;padding:28px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="44" height="44" valign="middle" style="width:44px;height:44px;"><img src="${siteUrl}/email/jamaal-icon.png" width="44" height="44" alt="Jamaal" style="display:block;width:44px;height:44px;border-radius:10px;"></td>
        <td style="padding-left:14px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;line-height:1;color:#EAF3F6;">Jamaal</td>
      </tr></table>
    </td></tr>

    <!-- Body -->
    <tr><td bgcolor="#FFFFFF" class="px" style="background:#FFFFFF;padding:44px 40px 12px 40px;">
      <p style="margin:0 0 14px 0;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3F6E80;">TestFlight beta &middot; iPhone, iPad and Mac</p>
      <h1 class="h1" style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:36px;line-height:1.12;color:#0A3A53;">The beta is open. <span style="font-style:italic;color:#1F6A58;">Here&rsquo;s your link.</span></h1>
      <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">Hi ${esc(greeting)},</p>
      <p style="margin:0 0 28px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">${esc(BETA_INVITE_INTRO)}</p>

      <!-- Button -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;"><tr>
        <td align="center" bgcolor="#9A4F2E" style="background:#9A4F2E;border-radius:999px;">
          <a href="${testflightUrl}" style="display:inline-block;padding:16px 36px;font-family:Helvetica,Arial,sans-serif;font-size:17px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Install the beta</a>
        </td>
      </tr></table>
      <p style="margin:0 0 36px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#3F6E80;">Open this email on your iPhone, iPad or Mac. If the button doesn&rsquo;t work, paste this into your browser:<br><a href="${testflightUrl}" style="color:#1F6A58;word-break:break-all;">${testflightUrl}</a></p>

      <!-- Steps -->
      <p style="margin:0 0 14px 0;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3F6E80;">Two minutes, three steps</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px 0;">
        <tr><td width="36" valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;font-family:'Courier New',monospace;font-size:14px;color:#9A4F2E;">01</td>
            <td valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#0A3A53;"><strong>Tap the button</strong> on the device you want to test on.</td></tr>
        <tr><td width="36" valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;font-family:'Courier New',monospace;font-size:14px;color:#9A4F2E;">02</td>
            <td valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#0A3A53;"><strong>Get TestFlight</strong> if you don&rsquo;t have it. It&rsquo;s Apple&rsquo;s free app for trying apps before they launch.</td></tr>
        <tr><td width="36" valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;border-bottom:1px solid #D9E4DE;font-family:'Courier New',monospace;font-size:14px;color:#9A4F2E;">03</td>
            <td valign="top" style="padding:14px 0;border-top:1px solid #D9E4DE;border-bottom:1px solid #D9E4DE;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#0A3A53;"><strong>Tap Accept, then Install.</strong> Jamaal appears like any other app.</td></tr>
      </table>

      <!-- What to try -->
      <p style="margin:0 0 14px 0;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3F6E80;">What to try first</p>
      <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">&bull; Add a few tasks and give each a rough size.</p>
      <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">&bull; Add one Anchor, such as the school run or a prayer window. <a href="${siteUrl}/journal/salah-quran-dhikr?utm_source=email&amp;utm_medium=beta_invite&amp;utm_campaign=beta" style="color:#1F6A58;">How Anchors work for prayer</a>.</p>
      <p style="margin:0 0 36px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">&bull; Try Night Planning this evening. It&rsquo;s five calm steps and takes a few minutes. <a href="${siteUrl}/journal/first-night-planning?utm_source=email&amp;utm_medium=beta_invite&amp;utm_campaign=beta" style="color:#1F6A58;">What your first night looks like</a>.</p>

      <!-- Worth a read -->
      <p style="margin:0 0 14px 0;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#3F6E80;">Worth a read</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px 0;">
        <tr><td style="padding:14px 0;border-top:1px solid #D9E4DE;border-bottom:1px solid #D9E4DE;">
          <a href="${siteUrl}/journal/anchors-the-things-your-day-moves-around?utm_source=email&amp;utm_medium=beta_invite&amp;utm_campaign=beta" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.3;color:#0A3A53;text-decoration:none;">What&rsquo;s an Anchor? &rarr;</a>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3F6E80;padding-top:4px;">The things your day moves around, and why they&rsquo;re marked attended, not done.</div>
        </td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #D9E4DE;">
          <a href="${siteUrl}/journal/your-day-on-one-list?utm_source=email&amp;utm_medium=beta_invite&amp;utm_campaign=beta" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.3;color:#0A3A53;text-decoration:none;">Your day, on one list &rarr;</a>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3F6E80;padding-top:4px;">How Today is laid out, and how the capacity slider decides what you see.</div>
        </td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #D9E4DE;">
          <a href="${siteUrl}/journal/why-i-built-jamaal?utm_source=email&amp;utm_medium=beta_invite&amp;utm_campaign=beta" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.3;color:#0A3A53;text-decoration:none;">Why I built Jamaal &rarr;</a>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3F6E80;padding-top:4px;">The story behind the app, and why it plans gently.</div>
        </td></tr>
      </table>

      <!-- Feedback -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px 0;"><tr>
        <td bgcolor="#EFF4F0" style="background:#EFF4F0;border-radius:14px;padding:22px 24px;">
          <p style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.2;color:#0A3A53;">If something feels wrong, tell me.</p>
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14506E;">That&rsquo;s what the beta is for. Reply to this email, or in TestFlight take a screenshot in the app and it will offer to send it with your note.</p>
        </td>
      </tr></table>

      <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#14506E;">Thank you for trying it first.</p>
      <p style="margin:0 0 32px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:20px;line-height:1.3;color:#0A3A53;">Fahad<br><span style="font-family:Helvetica,Arial,sans-serif;font-style:normal;font-size:14px;color:#3F6E80;">Maker of Jamaal</span></p>
    </td></tr>

    <!-- Small print -->
    <tr><td bgcolor="#FFFFFF" class="px" style="background:#FFFFFF;border-radius:0 0 20px 20px;padding:0 40px 36px 40px;">
      <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:#3F6E80;border-top:1px solid #D9E4DE;padding-top:20px;">The beta is free. Your list syncs through your own iCloud, there&rsquo;s no Jamaal account, and it works offline. TestFlight builds expire after 90 days, and TestFlight tells you when a new one is ready.</p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:#3F6E80;">You&rsquo;re getting this because you added your email at jamaal.app. You&rsquo;ll get one more email from me, at launch. <a href="${unsubscribeUrl}" style="color:#3F6E80;">Unsubscribe</a>.</p>
    </td></tr>

    <tr><td align="center" style="padding:20px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#3F6E80;">Jamaal &middot; Melbourne, Australia</td></tr>
  </table>

</td></tr>
</table>
</body>
</html>
`;
}

export function betaInviteText({
  firstName,
  testflightUrl,
  siteUrl,
  unsubscribeUrl,
}: BetaInviteEmailInput): string {
  const utm = 'utm_source=email&utm_medium=beta_invite&utm_campaign=beta';
  return `Hi ${greetingFor(firstName)},

${BETA_INVITE_INTRO}

Install the beta: ${testflightUrl}

Open this link on your iPhone, iPad or Mac. Two minutes, three steps:

1. Tap the link on the device you want to test on.
2. Get TestFlight if you don't have it. It's Apple's free app for trying apps before they launch.
3. Tap Accept, then Install. Jamaal appears like any other app.

What to try first
- Add a few tasks and give each a rough size.
- Add one Anchor, such as the school run or a prayer window. How Anchors work for prayer: ${siteUrl}/journal/salah-quran-dhikr?${utm}
- Try Night Planning this evening. It's five calm steps and takes a few minutes. What your first night looks like: ${siteUrl}/journal/first-night-planning?${utm}

Worth a read
- What's an Anchor? The things your day moves around, and why they're marked attended, not done. ${siteUrl}/journal/anchors-the-things-your-day-moves-around?${utm}
- Your day, on one list. How Today is laid out, and how the capacity slider decides what you see. ${siteUrl}/journal/your-day-on-one-list?${utm}
- Why I built Jamaal. The story behind the app, and why it plans gently. ${siteUrl}/journal/why-i-built-jamaal?${utm}

If something feels wrong, tell me. That's what the beta is for. Reply to this email, or in TestFlight take a screenshot in the app and it will offer to send it with your note.

Thank you for trying it first.

Fahad
Maker of Jamaal

--
The beta is free. Your list syncs through your own iCloud, there's no Jamaal account, and it works offline. TestFlight builds expire after 90 days, and TestFlight tells you when a new one is ready.

You're getting this because you added your email at jamaal.app. You'll get one more email from me, at launch. Unsubscribe: ${unsubscribeUrl}

Jamaal - Melbourne, Australia
`;
}
