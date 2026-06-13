const BRAND = {
  bg: "#F7F4EE",
  surface: "#F0EDE6",
  surfaceInset: "#EAE7E0",
  text1: "#2E2C28",
  text2: "#5A5750",
  text3: "#8C8880",
  text4: "#C4C0B8",
  accent: "#B5623A",
  accentHover: "#A04E2A",
  accentSubtle: "#F5E4D8",
  sage: "#6B8C72",
  sageSubtle: "#DFF0E1",
  sageText: "#3D5C42",
  borderSubtle: "rgba(46,44,40,0.10)",
};

const FONT = `'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export function baseEmail(content: string, previewText?: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>PDF Craft</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .card-pad { padding: 28px 20px !important; }
      .hide-sm { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; word-spacing: normal;">

  ${
    previewText
      ? `<div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}${"&nbsp;&#847;".repeat(20)}</div>`
      : ""
  }

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">

        <!-- Email container -->
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="width: 560px; max-width: 560px;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="https://pdf-craft.app" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="background-color: ${BRAND.accentSubtle}; border-radius: 10px; padding: 8px 14px; text-align: center;">
                      <span style="font-family: ${FONT}; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND.accentHover};">PDF Craft</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color: ${BRAND.surface}; border-radius: 20px; box-shadow: 0 2px 6px rgba(46,44,40,0.06), 0 8px 24px rgba(46,44,40,0.07);">
              <div class="card-pad" style="padding: 40px 44px;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <p style="margin: 0 0 6px; font-family: ${FONT}; font-size: 12px; color: ${BRAND.text3}; line-height: 1.6;">
                © ${year} PDF Craft &nbsp;·&nbsp;
                <a href="https://pdf-craft.app/privacy" style="color: ${BRAND.text3}; text-decoration: underline;">Privacy</a>
                &nbsp;·&nbsp;
                <a href="https://pdf-craft.app/terms" style="color: ${BRAND.text3}; text-decoration: underline;">Terms</a>
              </p>
              <p style="margin: 0; font-family: ${FONT}; font-size: 11px; color: ${BRAND.text4}; line-height: 1.5;">
                You're receiving this because you have an account at pdf-craft.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
    <tr>
      <td style="border-radius: 9999px; background-color: ${BRAND.accent}; text-align: center;">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="${BRAND.accent}"><w:anchorlock/><center><![endif]-->
        <a href="${href}" style="display: inline-block; padding: 14px 32px; font-family: ${FONT}; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 9999px; white-space: nowrap;">
          ${label}
        </a>
        <!--[if mso]></center></v:roundrect><![endif]-->
      </td>
    </tr>
  </table>`;
}

export function emailDivider(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td style="border-top: 1px solid ${BRAND.borderSubtle}; padding: 0; margin: 0;"></td></tr>
  </table>`;
}

export function emailLabel(text: string): string {
  return `<p style="margin: 0 0 14px; font-family: ${FONT}; font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: ${BRAND.accent};">${text}</p>`;
}
