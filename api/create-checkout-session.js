// /api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID manquant.' });
    }

    // Récupérer les détails du tarif pour savoir si c'est un abonnement ou un paiement unique
    const price = await stripe.prices.retrieve(priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: price.type === 'recurring' ? 'subscription' : 'payment', // 'subscription' pour les paiements récurrents
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // Active les codes promo sur la page de paiement
      allow_promotion_codes: true,
      // URLs de redirection après le paiement
      success_url: `${req.headers.origin}/succes.html`, // Créez une page de succès
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Erreur lors de la création de la session Stripe:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}