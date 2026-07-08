import { baseEmail, emailButton, emailLabel } from "./base";

const FONT = `'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

type OperationType = "pdf-merge" | "image-to-pdf" | "pdf-encrypt" | "pdf-decrypt" | "pdf-split" | "pdf-compress" | "pdf-sign";

interface OperationConfig {
  icon: string;
  iconBg: string;
  subject: string;
  heading: string;
  description: (fileName: string) => string;
  ctaLabel: string;
  note: string;
}

const OPERATION_CONFIG: Record<OperationType, OperationConfig> = {
  "pdf-merge": {
    icon: "📑",
    iconBg: "#F5E4D8",
    subject: "Your Merged PDF is Ready!",
    heading: "Your merged PDF is ready",
    description: (fileName) =>
      `All your files have been combined into <strong style="color: #2E2C28;">${fileName}</strong> and are ready to download.`,
    ctaLabel: "Download merged PDF",
    note: "Your merged PDF will be available for 24 hours.",
  },
  "image-to-pdf": {
    icon: "🖼️",
    iconBg: "#DFF0E1",
    subject: "Your Image to PDF is Ready!",
    heading: "Your PDF is ready",
    description: (fileName) =>
      `Your images have been converted and saved as <strong style="color: #2E2C28;">${fileName}</strong>.`,
    ctaLabel: "Download PDF",
    note: "Your converted PDF will be available for 24 hours.",
  },
  "pdf-encrypt": {
    icon: "🔒",
    iconBg: "#D6EAF8",
    subject: "Your Protected PDF is Ready!",
    heading: "Your PDF is password protected",
    description: (fileName) =>
      `<strong style="color: #2E2C28;">${fileName}</strong> has been encrypted and is secured with your chosen password.`,
    ctaLabel: "Download protected PDF",
    note: "Keep your password safe — it cannot be recovered if lost.",
  },
  "pdf-decrypt": {
    icon: "🔓",
    iconBg: "#FFF3D4",
    subject: "Your Unlocked PDF is Ready!",
    heading: "Your PDF has been unlocked",
    description: (fileName) =>
      `Password protection has been removed from <strong style="color: #2E2C28;">${fileName}</strong>.`,
    ctaLabel: "Download unlocked PDF",
    note: "Your unlocked PDF will be available for 24 hours.",
  },
  "pdf-split": {
    icon: "✂️",
    iconBg: "#E8F0FE",
    subject: "Your Split PDF is Ready!",
    heading: "Your PDF has been split",
    description: (fileName) =>
      `Your page ranges have been extracted and saved as <strong style="color: #2E2C28;">${fileName}</strong>.`,
    ctaLabel: "Download split PDF",
    note: "Your file will be available for 24 hours.",
  },
  "pdf-compress": {
    icon: "🗜️",
    iconBg: "#FDF3E7",
    subject: "Your Compressed PDF is Ready!",
    heading: "Your PDF has been compressed",
    description: (fileName) =>
      `<strong style="color: #2E2C28;">${fileName}</strong> has been compressed and is ready to download.`,
    ctaLabel: "Download compressed PDF",
    note: "Your compressed PDF will be available for 24 hours.",
  },
  "pdf-sign": {
    icon: "✍️",
    iconBg: "#EDE9FE",
    subject: "Your Signed PDF is Ready!",
    heading: "Your PDF has been signed",
    description: (fileName) =>
      `Your signature has been embedded in <strong style="color: #2E2C28;">${fileName}</strong> along with an audit record.`,
    ctaLabel: "Download signed PDF",
    note: "Your signed PDF will be available for 24 hours.",
  },
};

interface PdfOperationEmailData {
  operationType: OperationType;
  fileName: string;
  fileUrl: string;
}

export function pdfOperationEmailHtml(data: PdfOperationEmailData): string {
  const { operationType, fileName, fileUrl } = data;
  const config = OPERATION_CONFIG[operationType];

  const content = `
    <!-- Icon -->
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; width: 52px; height: 52px; background-color: ${config.iconBg}; border-radius: 14px; text-align: center; line-height: 52px; font-size: 26px;">
        ${config.icon}
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 10px; font-family: ${FONT}; font-size: 26px; font-weight: 700; color: #2E2C28; line-height: 1.2; letter-spacing: -0.4px;">
      ${config.heading}
    </h1>
    <p style="margin: 0 0 32px; font-family: ${FONT}; font-size: 17px; color: #5A5750; line-height: 1.65;">
      ${config.description(fileName)}
    </p>

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    ${emailLabel("Your file")}

    <!-- File card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="background-color: #F7F4EE; border-radius: 12px; padding: 16px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td valign="middle">
                <span style="display: inline-block; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; color: #5A5750; word-break: break-all;">${fileName}</span>
              </td>
              <td width="12"></td>
              <td valign="middle" width="1" style="white-space: nowrap;">
                <span style="display: inline-block; background-color: #EAE7E0; border-radius: 9999px; padding: 3px 10px; font-family: ${FONT}; font-size: 11px; font-weight: 600; color: #8C8880; white-space: nowrap;">PDF</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${emailButton(config.ctaLabel, fileUrl)}

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; margin-bottom: 20px;">
      <tr><td style="border-top: 1px solid rgba(46,44,40,0.10);"></td></tr>
    </table>

    <p style="margin: 0; font-family: ${FONT}; font-size: 14px; color: #8C8880; line-height: 1.6; text-align: center;">
      ${config.note}
    </p>
  `;

  return baseEmail(content, `${config.heading} — download ${fileName} now.`);
}

export function pdfOperationSubject(operationType: OperationType): string {
  return OPERATION_CONFIG[operationType].subject;
}
