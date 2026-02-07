const stripeClient = require("../config/stripe");
const BookingsModel = require("../models/Bookings");
const ShowModel = require("../models/Show");
const redis = require("../config/redisClient");

/**
 * CREATE CHECKOUT SESSION
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { seats, showId } = req.body;

    const show = await ShowModel.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    let totalAmount = 0;
    seats.forEach((seat) => {
      const seatRow = seat[0]; // A / B / C
      totalAmount += show.pricing[seatRow];
    });

    const lineItems = seats.map((seat) => {
      const seatRow = seat[0];
      const price = show.pricing[seatRow];

      return {
        price_data: {
          currency: show.currency || "inr",
          unit_amount: price * 100,
          product_data: {
            name: `${show.title} - ${seat}`,
            images: [show.posterUrl],
          },
        },
        quantity: 1,
      };
    });

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `http://localhost:4000/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:4000/result?session_id={CHECKOUT_SESSION_ID}&isCancelled=true`,
      // Pass showId and seats as metadata to be used in success/cancel controllers
      metadata: {
        showId,
        seats: JSON.stringify(seats),
      },
    });

    await BookingsModel.create({
      showId,
      seats,
      amount: totalAmount,
      status: "pending",
      stripeSessionId: session.id,
    });

    res.send(session.url);
  } catch (error) {
    next(error);
  }
};

/**
 * COMMON RESPONSE BUILDER
 */
const buildBookingResponse = async (sessionId) => {
  const session = await stripeClient.checkout.sessions.retrieve(sessionId);

  const booking = await BookingsModel.findOne({
    stripeSessionId: sessionId,
  });

  if (!booking) return null;

  const show = await ShowModel.findById(booking.showId);

  return {
    sessionId,
    paymentStatus: session.payment_status,
    amount: booking.amount,
    seats: booking.seats,
    show: {
      title: show.title,
      posterUrl: show.posterUrl,
      screen: show.screen,
      startTime: show.startTime,
      currency: show.currency,
    },
  };
};

/**
 * SUCCESS CONTROLLER
 */
const getSuccessBookingDetails = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    const data = await buildBookingResponse(session_id);
    if (!data) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * CANCEL CONTROLLER
 */
const getCancelBookingDetails = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    // Fetch Stripe session
    const session = await stripeClient.checkout.sessions.retrieve(session_id);

    const showId = session.metadata.showId;
    const seats = JSON.parse(session.metadata.seats);

    // Release seats from Redis
    const redisKey = `locked_seats:${showId}`;
    await redis.sRem(redisKey, seats);

    // Fetch show details (READ-ONLY)
    const show = await ShowModel.findById(showId).lean();

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // 4️⃣ Respond with full payload
    res.json({
      status: "cancelled",
      seatsReleased: seats,
      show: {
        title: show.title,
        posterUrl: show.posterUrl,
        screen: show.screen,
        startTime: show.startTime,
        currency: show.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  getSuccessBookingDetails,
  getCancelBookingDetails,
};
