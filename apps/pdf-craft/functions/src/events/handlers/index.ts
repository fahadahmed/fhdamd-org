import { AppEventHandler } from './types';
import { handleImageToPdf } from './imageToPdf';

export const eventHandlers: Record<string, AppEventHandler> = {
  'image-to-pdf': handleImageToPdf,
};
