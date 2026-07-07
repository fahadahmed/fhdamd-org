import type { TypedEventHandler } from "./types";
import type { PdfOperationPayload } from "../types";
import { sendOperationEmail } from "./sendOperationEmail";

export const handleCompressPdf: TypedEventHandler<PdfOperationPayload> = (payload) =>
  sendOperationEmail(payload);
