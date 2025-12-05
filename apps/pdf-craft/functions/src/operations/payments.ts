import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';

dotenv.config();
admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-11-17.clover',
});

export const processPayment = onRequest(async (request, response) => {
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
          success_url: `${process.env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.BASE_URL}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
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
