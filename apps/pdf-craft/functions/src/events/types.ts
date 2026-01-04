export interface AppEventPayload {
  userId: string;
  userEmail: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  eventType: 'pdf-merged' | 'image-to-pdf';
  timestamp: number;
}
