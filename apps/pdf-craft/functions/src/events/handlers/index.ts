import type { AppEventHandler } from "./types";
import { handleImageToPdf } from "./imageToPdf";
import { handleMergePdfs } from "./mergePdfs";
import { handleEncryptPdf } from "./encrypt";
import { handleDecryptPdf } from "./decrypt";

export const eventHandlers: Record<string, AppEventHandler> = {
  "image-to-pdf": handleImageToPdf,
  "pdf-merge": handleMergePdfs,
  "pdf-encrypt": handleEncryptPdf,
  "pdf-decrypt": handleDecryptPdf,
};
