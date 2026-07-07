export interface PdfOperationPayload {
  eventType: "pdf-merge" | "image-to-pdf" | "pdf-encrypt" | "pdf-decrypt" | "pdf-split" | "pdf-compress";
  userId: string;
  userEmail: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  timestamp: number;
  requestId: string;
}

export interface UserCreatedPayload {
  eventType: "user-created";
  userId: string;
  userEmail: string;
  displayName: string;
  timestamp: number;
  requestId: string;
}

export interface CreditsPurchasedPayload {
  eventType: "credits-purchased";
  userId: string;
  userEmail: string;
  displayName: string;
  creditsPurchased: number;
  creditsTotal: number;
  amountCents: number;
  currency: string;
  timestamp: number;
  requestId: string;
}

export type AppEventPayload = PdfOperationPayload | UserCreatedPayload | CreditsPurchasedPayload;
