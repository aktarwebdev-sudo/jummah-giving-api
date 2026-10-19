// api/create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Allow CORS from your Hostinger site
  // === CORS – change the origin to your real domain ===
  const allowedOrigin = 'https://darus-salam.com/';   // ← put your Hostinger domain here
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin); // later restrict to your domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body; // amount in pounds, e.g. 7.50

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Minimum donation is £1' });
    }

    const amountInPence = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Jummah Giving – Weekly Donation',
              description: 'Recurring weekly sadaqah',
            },
            unit_amount: amountInPence,
            recurring: {
              interval: 'week',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://darus-salam.com/thank-you', // change this
      cancel_url: 'https://darus-salam.com/transaction-cancelled',     // change this
      submit_type: 'donate',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
