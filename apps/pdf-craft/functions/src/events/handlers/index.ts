import type { AppEventHandler } from "./types";
import { handleImageToPdf } from "./imageToPdf";
import { handleMergePdfs } from "./mergePdfs";
import { handleEncryptPdf } from "./encrypt";
import { handleDecryptPdf } from "./decrypt";
import { handleSplitPdf } from "./split";
import { handleCompressPdf } from "./compress";
import { handleSignPdf } from "./sign";
import { handleUserCreated } from "./userCreated";
import { handleCreditsPurchased } from "./creditsPurchased";

export const eventHandlers: Record<string, AppEventHandler> = {
  "image-to-pdf": handleImageToPdf,
  "pdf-merge": handleMergePdfs,
  "pdf-encrypt": handleEncryptPdf,
  "pdf-decrypt": handleDecryptPdf,
  "pdf-split": handleSplitPdf,
  "pdf-compress": handleCompressPdf,
  "pdf-sign": handleSignPdf,
  "user-created": handleUserCreated,
  "credits-purchased": handleCreditsPurchased,
};
