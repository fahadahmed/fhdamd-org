import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2025-11-17.clover',
});

export const processPayment = onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method not allowed');
    return;
  }

  // Here you would typically handle the payment processing logic
  // For example, integrating with a payment gateway like Stripe or PayPal
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 299,
            product_data: { name: 'PCD-Craft Credits' },
          },
          quantity: 1,
        },
      ],
      success_url:
        'http://localhost:4321/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:
        'http://localhost:4321/payment-cancel?session_id={CHECKOUT_SESSION_ID}',
      metadata: {
        userId: 'fahad.ahmed@me.com',
        credits: 5,
      },
    });

    response.status(200).json({ url: session.url });
  } catch (error) {
    logger.error('Payment processing error', error);
    response.status(500).json({ error: 'Payment processing failed' });
    return;
  }
});
