// /api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // On récupère le priceId ET l'email du client
    const { priceId, customerEmail } = req.body;

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'ID de tarif ou e-mail manquant.' });
    }

    const price = await stripe.prices.retrieve(priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // On pré-remplit l'email du client sur la page de paiement Stripe
      customer_email: customerEmail,
      allow_promotion_codes: true,
      success_url: `${req.headers.origin}/succes.html`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Erreur lors de la création de la session Stripe:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}