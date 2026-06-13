import { baseEmail, emailButton, emailLabel } from "./base";

const FONT = `'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

interface CreditsPurchasedData {
  displayName: string;
  creditsPurchased: number;
  creditsTotal: number;
  amountCents: number;
  currency: string;
}

export function creditsPurchasedEmailHtml(data: CreditsPurchasedData): string {
  const { displayName, creditsPurchased, creditsTotal, amountCents, currency } = data;
  const firstName = displayName.split(" ")[0] || "there";

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amountCents / 100);

  const content = `
    <!-- Success pill -->
    <div style="text-align: center; margin-bottom: 28px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #DFF0E1; border-radius: 9999px; padding: 8px 20px; text-align: center;">
            <span style="font-family: ${FONT}; font-size: 13px; font-weight: 600; color: #3D5C42; white-space: nowrap;">
              ✓ &nbsp;Payment successful
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 10px; text-align: center; font-family: ${FONT}; font-size: 30px; font-weight: 700; color: #2E2C28; line-height: 1.15; letter-spacing: -0.5px;">
      ${creditsPurchased} credits added
    </h1>
    <p style="margin: 0 0 32px; text-align: center; font-family: ${FONT}; font-size: 17px; color: #5A5750; line-height: 1.65;">
      Thanks ${firstName}, your credits are ready to use right now.
    </p>

    <!-- Credit balance card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 28px;">
      <tr>
        <td style="background-color: #F7F4EE; border-radius: 14px; padding: 24px 28px; text-align: center;">
          <p style="margin: 0 0 6px; font-family: ${FONT}; font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: #8C8880;">
            Current balance
          </p>
          <p style="margin: 0; font-family: ${FONT}; font-size: 48px; font-weight: 700; color: #B5623A; line-height: 1; letter-spacing: -2px;">
            ${creditsTotal}
            <span style="font-size: 18px; font-weight: 400; color: #8C8880; letter-spacing: 0; vertical-align: middle;">&nbsp;credits</span>
          </p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    ${emailLabel("Purchase summary")}

    <!-- Summary rows -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="font-family: ${FONT}; font-size: 15px; color: #5A5750; padding-bottom: 12px;">Credits purchased</td>
        <td align="right" style="font-family: ${FONT}; font-size: 15px; font-weight: 600; color: #2E2C28; padding-bottom: 12px;">+${creditsPurchased}</td>
      </tr>
      <tr>
        <td style="border-top: 1px solid rgba(46,44,40,0.10); font-family: ${FONT}; font-size: 15px; color: #5A5750; padding-top: 12px;">Amount charged</td>
        <td align="right" style="border-top: 1px solid rgba(46,44,40,0.10); font-family: ${FONT}; font-size: 15px; font-weight: 600; color: #2E2C28; padding-top: 12px;">${formattedAmount}</td>
      </tr>
    </table>

    ${emailButton("Use your credits →", "https://pdf-craft.app/dashboard")}

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; margin-bottom: 20px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    <p style="margin: 0; font-family: ${FONT}; font-size: 14px; color: #8C8880; line-height: 1.6; text-align: center;">
      Each PDF operation uses 1 credit. Questions about your purchase?
      <a href="mailto:support@pdf-craft.app" style="color: #B5623A; text-decoration: underline;">Contact us</a>.
    </p>
  `;

  return baseEmail(
    content,
    `${creditsPurchased} credits added — your PDF Craft balance is now ${creditsTotal}.`
  );
}
