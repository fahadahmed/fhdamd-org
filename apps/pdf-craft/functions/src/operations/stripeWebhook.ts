import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const db = getFirestore();

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-11-17.clover',
});

export const stripeWebhook = onRequest(
  {
    cors: true,
  },
  async (request, response) => {
    const sig = request.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    const rawBody = request.rawBody;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody as Buffer, // 👈 force it to Buffer
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    console.log('✅ Webhook verified:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ Event received:', event.id);
      console.log('Session details:', session.metadata);

      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);
      console.log(`User ID: ${userId}, Credits to add: ${credits}`);
      if (userId && credits > 0) {
        const userRef = db.collection('users').doc(userId);
        console.log(userRef);
        try {
          await userRef.update({
            'profile.credits': FieldValue.increment(credits),
          });
          console.log(`✅ Updated user ${userId} with ${credits} credits.`);
        } catch (err) {
          console.error('❌ Error updating user credits:', err);
        }
      }
    }
    // Acknowledge immediately so Stripe doesn’t retry
    response.status(200).send('ok');
  }
);
