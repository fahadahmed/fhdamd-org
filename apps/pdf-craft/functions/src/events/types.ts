export interface AppEventPayload {
  userId: string;
  userEmail: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  eventType: "pdf-merge" | "image-to-pdf" | "pdf-encrypt" | "pdf-decrypt";
  timestamp: number;
  requestId: string;
}
