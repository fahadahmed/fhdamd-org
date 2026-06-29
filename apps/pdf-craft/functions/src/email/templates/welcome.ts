import { baseEmail, emailButton, emailLabel } from "./base";

const FONT = `'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

const FEATURES = [
  {
    icon: "📑",
    iconBg: "#F5E4D8",
    title: "Merge PDFs",
    desc: "Combine multiple documents into one perfectly ordered PDF.",
  },
  {
    icon: "🖼️",
    iconBg: "#DFF0E1",
    title: "Image to PDF",
    desc: "Turn any image or photo into a clean, shareable PDF.",
  },
  {
    icon: "🔒",
    iconBg: "#D6EAF8",
    title: "Protect & Unlock",
    desc: "Password-protect sensitive PDFs or remove existing restrictions.",
  },
];

export function welcomeEmailHtml(displayName: string): string {
  const firstName = displayName.split(" ")[0];

  const featureRows = FEATURES.map(
    ({ icon, iconBg, title, desc }) => `
    <tr>
      <td style="padding-bottom: 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="44" valign="top" style="padding-right: 14px;">
              <div style="width: 36px; height: 36px; background-color: ${iconBg}; border-radius: 9px; text-align: center; line-height: 36px; font-size: 18px;">${icon}</div>
            </td>
            <td valign="top">
              <p style="margin: 0 0 3px; font-family: ${FONT}; font-size: 15px; font-weight: 600; color: #2E2C28;">${title}</p>
              <p style="margin: 0; font-family: ${FONT}; font-size: 14px; color: #5A5750; line-height: 1.55;">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
  ).join("");

  const content = `
    <!-- Greeting -->
    <h1 style="margin: 0 0 10px; font-family: ${FONT}; font-size: 30px; font-weight: 700; color: #2E2C28; line-height: 1.15; letter-spacing: -0.5px;">
      Welcome, ${firstName}!
    </h1>
    <p style="margin: 0 0 32px; font-family: ${FONT}; font-size: 17px; color: #5A5750; line-height: 1.65;">
      Your Riqa account is ready. Convert, merge, and secure your PDFs — right from your browser.
    </p>

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    ${emailLabel("What you can do")}

    <!-- Features -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 8px;">
      ${featureRows}
    </table>

    <!-- Credits note -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="background-color: #F7F4EE; border-radius: 12px; padding: 14px 18px;">
          <p style="margin: 0; font-family: ${FONT}; font-size: 14px; color: #5A5750; line-height: 1.6;">
            ✦ &nbsp;Credits are deducted per operation and never expire. Buy more anytime on the
            <a href="https://riqa.app/buy-credits" style="color: #B5623A; text-decoration: underline;">pricing page</a>.
          </p>
        </td>
      </tr>
    </table>

    ${emailButton("Go to your dashboard →", "https://riqa.app/dashboard")}

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; margin-bottom: 20px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    <p style="margin: 0; font-family: ${FONT}; font-size: 14px; color: #8C8880; line-height: 1.6; text-align: center;">
      Need help? Reply to this email or visit our
      <a href="https://riqa.app/help" style="color: #B5623A; text-decoration: underline;">help centre</a>.
    </p>
  `;

  return baseEmail(content, `Welcome to Riqa, ${firstName}! Your account is ready.`);
}
