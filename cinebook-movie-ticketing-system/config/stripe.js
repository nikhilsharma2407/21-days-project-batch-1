const stripe = require("stripe");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripeClient = stripe(STRIPE_SECRET_KEY);

module.exports = stripeClient;
