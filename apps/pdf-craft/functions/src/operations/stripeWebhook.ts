import { onRequest } from 'firebase-functions/v2/https';
// import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

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

      // const db = getFirestore();

      // if (session.metadata?.userId && session.metadata?.credits) {
      //   const userRef = db.collection('users').doc(session.metadata.userId);
      //   const userDoc = await userRef.get();

      //   if (userDoc.exists) {
      //     const userData = userDoc.data();
      //     const currentCredits = userData?.profile?.credits || 0;
      //     const purchasedCredits = parseInt(session.metadata.credits, 10);

      //     await userRef.update({
      //       'profile.credits': currentCredits + purchasedCredits,
      //       'profile.isSubscriber': true,
      //     });

      //     console.log(
      //       `✅ Updated user ${session.metadata.userId} with ${purchasedCredits} credits.`
      //     );
      //   }
      // }
    }
    // Acknowledge immediately so Stripe doesn’t retry
    response.status(200).send('ok');
  }
);
