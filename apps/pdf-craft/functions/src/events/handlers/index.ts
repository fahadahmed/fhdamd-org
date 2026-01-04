import { AppEventHandler } from './types';
import { handleImageToPdf } from './imageToPdf';
import { handleMergePdfs } from './mergePdfs';

export const eventHandlers: Record<string, AppEventHandler> = {
  'image-to-pdf': handleImageToPdf,
  'pdf-merge': handleMergePdfs,
};
