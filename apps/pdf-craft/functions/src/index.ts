import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
admin.initializeApp();

const db = getFirestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const baseUrl = process.env.APP_BASE_URL;

const corsHandler = cors({
  origin: [
    'http://localhost:4321',
    'https://dev.pdf-craft.app',
    'https://stg.pdf-craft.app',
    'https://pdf-craft.app',
  ],
});

const processPayment = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    if (request.method === 'OPTIONS') {
      response.set(204).send('');
      return;
    }
    if (request.method !== 'POST') {
      response.status(405).send('Method not allowed');
      return;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).send('Unauthorized: No Bearer token provided');
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!baseUrl) {
      throw new Error('BASE_URL is not configured');
    }

    try {
      // Verify token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Now you know the user is authenticated
      const uid = decodedToken.uid;

      // Continue to payment processing
      const data =
        typeof request.body === 'string'
          ? JSON.parse(request.body)
          : request.body;
      const {
        credits,
        amount,
        quantity,
        currency,
        productName,
        userId,
        userEmail,
      } = data;
      if (uid === userId) {
        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
              {
                price_data: {
                  currency: currency,
                  unit_amount: amount,
                  product_data: { name: productName },
                },
                quantity: quantity,
              },
            ],
            success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
              userId: userId,
              userEmail: userEmail,
              credits: credits,
            },
          });
          response.status(200).json({ url: session.url });
          return;
        } catch (error) {
          logger.error('Payment processing error', error);
          response.status(500).json({ error: 'Payment processing failed' });
          return;
        }
      } else {
        response.status(403).send('Forbidden: User ID does not match token');
        return;
      }
    } catch (error) {
      response.status(401).send('Unauthorized: Invalid token');
      return;
    }
  });
});

const stripeWebhook = onRequest({ cors: true }, async (request, response) => {
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
});

export { processPayment, stripeWebhook };
