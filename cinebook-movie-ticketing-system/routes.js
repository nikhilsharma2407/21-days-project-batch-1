const { Router } = require("express");

const router = Router();
const ShowModel = require("./models/Show");
const BookingsModel = require("./models/Bookings");

const redis = require("./config/redisClient");
const { createCheckoutSession, getCancelBookingDetails, getSuccessBookingDetails } = require("./controllers/stripeController");

const seedAvailableSeats = async (showId, showDetails) => {
  const availableKey = `available_seats:${showId}`;
  const exists = await redis.exists(availableKey);

  if (!exists) {
    console.log(
      "Seeding available seats for show:",
      showId,
      showDetails.seats.sort(),
    );
    await redis.sAdd(availableKey, showDetails.seats);
  }
};

router.get("/shows", async (req, res, next) => {
  const shows = await ShowModel.find({});
  res.send(shows);
});

router.get("/shows/:showId/seats", async (req, res, next) => {
  try {
    const { showId } = req.params;

    const showDetails = await ShowModel.findById(showId);

    if (!showDetails) {
      res.status(404).send({ message: "Show not found" });
      return;
    }

    const availableKey = `available_seats:${showId}`;
    const lockedKey = `locked_seats:${showId}`;

    await seedAvailableSeats(showId, showDetails);

    const availableSeats = await redis.sMembers(availableKey);
    const lockedSeats = await redis.sMembers(lockedKey);
    res.send({
      availableSeats,
      lockedSeats: [...lockedSeats, ...showDetails.bookedSeats],
    });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/book-seats", async (req, res, next) => {
  try {
    const { seats, showId, time = 600 } = req.body;
    const availableKey = `available_seats:${showId}`;
    const lockedKey = `locked_seats:${showId}`;
    const tempRequestKey = `request_seats:${Date.now()}`;

    await redis.sAdd(tempRequestKey, seats);
    await redis.expire(tempRequestKey, 5);

    const lockedIntersection = await redis.sInter([tempRequestKey, lockedKey]);

    if (lockedIntersection.length > 0) {
      await redis.del(tempRequestKey);
      return res.status(409).send({
        message: "Some seats are not available",
      });
    }

    const intersection = await redis.sInter([tempRequestKey, availableKey]);
    if (intersection.length !== seats.length) {
      await redis.del(tempRequestKey);
      return res.status(409).send({
        message: "Some seats are not available",
      });
    }

    // AVAILAB seats - A1,A2 A3
    await redis.sAdd(lockedKey, seats); //A1, A2
    await redis.expire(lockedKey, time);

    await redis.del(tempRequestKey);

    res.send({
      message: `Seats locked for ${time / 60} minutes`,
      data: seats,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/checkout", createCheckoutSession);
router.get("/bookings/success", getSuccessBookingDetails);
router.get("/bookings/cancel", getCancelBookingDetails);

module.exports = router;
