import { Resend } from 'resend';
import { defineSecret } from 'firebase-functions/params';

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

let resendClient: Resend | null = null;

export function getResend() {
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY.value());
  }
  return resendClient;
}
