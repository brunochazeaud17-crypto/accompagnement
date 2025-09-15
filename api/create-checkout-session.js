// /api/create-checkout-session.js (VERSION CORRIGÉE)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // On s'assure que la requête est bien de type POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { priceId, customerEmail } = JSON.parse(event.body);

    if (!priceId || !customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID de tarif ou e-mail manquant.' }),
      };
    }

    const price = await stripe.prices.retrieve(priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer_email: customerEmail,
      allow_promotion_codes: true,
      success_url: `${process.env.URL}/succes.html`, // Netlify fournit la variable URL
      cancel_url: `${process.env.URL}/`,
    });

    // C'est ici la syntaxe corrigée pour une réponse réussie
    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };

  } catch (err) {
    console.error('Erreur lors de la création de la session Stripe:', err);
    // C'est ici la syntaxe corrigée pour une réponse d'erreur
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur interne du serveur.' }),
    };
  }
};