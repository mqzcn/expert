import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import {
  sendBookingNotification,
  sendBookingStatusUpdate,
} from "../utils/email.js";
import Stripe from "stripe";

// TODO: Move Stripe secret key to environment variables
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// For now, using a placeholder key. Replace with your actual key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // IMPORTANT: Replace with your test secret key

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // TODO: Fetch booking details from the database
  // For now, using placeholder data
  const booking = {
    _id: bookingId,
    // Assuming a fixed price or a way to retrieve/calculate it
    // For this example, let's use a placeholder amount of $50 (5000 cents)
    amount: 5000, // amount in cents
    currency: "usd",
    description: `Payment for Booking ID: ${bookingId}`,
  };

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            product_data: {
              name: booking.description,
              // You can add more product details here if needed
              // images: ['url_to_your_product_image']
            },
            unit_amount: booking.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // TODO: Replace with actual frontend URLs
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-cancelled?booking_id=${bookingId}`,
      // success_url: `https://expertlanguage.co.uk/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `https://expertlanguage.co.uk/booking-cancelled?booking_id=${bookingId}`,
      metadata: {
        bookingId: booking.id, // Store bookingId to retrieve in webhook
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

export const createBooking = asyncHandler(async (req, res) => {
  const { languageId, date, startTime, endTime } = req.body;

  // Calculate duration and price
  const startHour = parseInt(startTime.split(":")[0]);
  const startMinutes = parseInt(startTime.split(":")[1]) || 0;
  const endHour = parseInt(endTime.split(":")[0]);
  const endMinutes = parseInt(endTime.split(":")[1]) || 0;

  // Calculate duration in decimal hours
  const durationInHours =
    endHour + endMinutes / 60 - (startHour + startMinutes / 60);

  if (durationInHours <= 0) {
    // It's good practice to also ensure endTime is after startTime if not already handled by frontend validation
    res.status(400).json({
      message:
        "Booking end time must be after start time and duration must be positive.",
    });
    return;
  }

  const ratePerHourGBP = 39; // £39 per hour
  const amountInGBP = durationInHours * ratePerHourGBP;
  const amountInPence = Math.round(amountInGBP * 100); // Stripe expects amount in smallest currency unit (pence)

  // Create the booking document in the database first
  let booking;
  try {
    booking = await Booking.create({
      client: req.user._id,
      language: languageId,
      date,
      startTime,
      endTime,
      status: "pending", // Overall booking status
      paymentStatus: "pending", // Initial payment status
      // stripeSessionId will be updated after session creation
      // Optionally store the calculated amount at booking creation if desired
      // bookingAmount: amountInPence,
      // bookingCurrency: "gbp",
    });
  } catch (dbError) {
    console.error("Error creating booking in DB:", dbError);
    res.status(500).json({ error: "Failed to create booking" });
    return;
  }

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL
      }/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id.toString()}`,
      cancel_url: `${
        process.env.FRONTEND_URL
      }/booking-cancelled?booking_id=${booking._id.toString()}`,
      client_reference_id: booking._id.toString(),
      line_items: [
        {
          price_data: {
            currency: "gbp", // Changed to GBP
            product_data: {
              name: "Language Service Booking",
              description: `Booking for ${new Date(
                date
              ).toLocaleDateString()} from ${startTime} to ${endTime} (${durationInHours.toFixed(
                2
              )} hours)`,
            },
            unit_amount: amountInPence, // Use calculated amount in pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    // Update booking with Stripe Session ID and final amount
    booking.stripeSessionId = session.id;
    booking.bookingAmount = amountInPence;
    booking.bookingCurrency = "gbp";
    await booking.save();

    // Respond with session ID and booking ID
    res.status(201).json({ sessionId: session.id, bookingId: booking._id });
  } catch (stripeError) {
    console.error("Error creating Stripe session:", stripeError);
    // Optional: If Stripe fails, you might want to delete the created booking
    // or mark its paymentStatus as 'failed' immediately.
    // For now, just set paymentStatus to 'failed'.
    if (booking) {
      booking.paymentStatus = "failed";
      // Consider if the main booking.status should also be updated, e.g., to 'payment_failed'.
      // This depends on how you want to handle bookings that were created but payment failed to initiate.
      // For example: booking.status = 'payment_failed';
      // You might also want to add a field for stripeError details to the booking document.
      await booking
        .save()
        .catch((saveError) =>
          console.error(
            "Error updating booking to 'payment_failed':",
            saveError
          )
        );
    }
    // Send a clear error message to the frontend
    res.status(500).json({
      message:
        "Failed to create payment session. Your booking may be pending payment initiation. Please try again or contact support.",
      error: stripeError.message,
    });
    return; // Ensure no further code in this block is executed
  }

  // Old notification logic (to be moved to webhook after payment confirmation)
  // const interpreters = await User.find({
  //   role: "interpreter",
  //   languages: languageId,
  //   isAvailable: true, // Add this condition
  // });
  // const populatedBooking = await Booking.findById(booking._id)
  //   .populate("client", "name email")
  //   .populate("language", "name code");
  // if (booking) { // This if condition is now part of the try-catch for DB
  //   await sendBookingNotification(interpreters, populatedBooking);
  //   // res.status(201).json(populatedBooking); // Response is now sent after Stripe session creation
  // } else { // This else is now handled by the catch for DB
  //   res.status(400);
  //   throw new Error("Invalid booking data");
  // }
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("client", "name email")
    .populate("interpreter", "name email")
    .populate("language", "name code");
  res.json(bookings);
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ client: req.user._id })
    .populate("interpreter", "name email")
    .populate("language", "name code")
    .sort("-createdAt");
  res.json(bookings);
});

export const getInterpreterBookings = asyncHandler(async (req, res) => {
  // Get interpreter's languages
  const interpreter = await User.findById(req.user._id);

  // Find all bookings that either:
  // 1. Are assigned to this interpreter OR
  // 2. Are pending AND in a language this interpreter provides
  const bookings = await Booking.find({
    $or: [
      { interpreter: req.user._id }, // Bookings assigned to this interpreter
      {
        status: "pending",
        language: { $in: interpreter.languages }, // Pending bookings in interpreter's languages
      },
    ],
  })
    .populate("client", "name email")
    .populate("language", "name code")
    .sort("-createdAt");

  res.json(bookings);
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  // Get all bookings for the selected date
  const existingBookings = await Booking.find({
    date,
    status: { $ne: "cancelled" },
  });

  // Generate time slots from 9 AM to 5 PM
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    const startTime = `${hour}:00`;
    const endTime = `${hour + 1}:00`;

    // Check if slot is already booked
    const isBooked = existingBookings.some(
      (booking) => booking.startTime === startTime
    );

    if (!isBooked) {
      slots.push({
        id: `${startTime}-${endTime}`,
        startTime,
        endTime,
      });
    }
  }

  res.json(slots);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      interpreter: req.user._id, // Set the interpreter when accepting the booking
    },
    { new: true }
  )
    .populate("client", "name email")
    .populate("interpreter", "name email")
    .populate("language", "name code");

  // If the status is being updated to 'accepted', send notification
  if (req.body.status === "accepted") {
    await sendBookingStatusUpdate(updatedBooking, updatedBooking.status);
  }

  res.json(updatedBooking);
});

export const getBookedSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  // Get all bookings for the selected date
  const bookings = await Booking.find({
    date,
    status: { $ne: "cancelled" },
  });

  // Extract all booked time slots
  const bookedSlots = new Set();
  bookings.forEach((booking) => {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);

    // Add all hours between start and end to booked slots
    for (let hour = startHour; hour < endHour; hour++) {
      bookedSlots.add(`${hour.toString().padStart(2, "0")}:00`);
    }
  });

  res.json(Array.from(bookedSlots));
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate("client", "name email")
    .populate("interpreter", "name email")
    .populate("language", "name code");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check permissions
  const userRole = req.user.role;
  const isClient = req.user._id.equals(booking.client._id);
  const isInterpreter =
    booking.interpreter && req.user._id.equals(booking.interpreter._id);

  // Validate status transitions
  if (userRole === "client") {
    // Clients can only cancel bookings
    if (status !== "cancelled") {
      res.status(403);
      throw new Error("Clients can only cancel bookings");
    }
    // Can't cancel completed or already cancelled bookings
    if (["completed", "cancelled"].includes(booking.status)) {
      res.status(400);
      throw new Error("Cannot cancel completed or already cancelled bookings");
    }
  } else if (userRole === "interpreter" && isInterpreter) {
    // Interpreters can only update to completed
    if (status !== "completed") {
      res.status(403);
      throw new Error("Interpreters can only mark bookings as completed");
    }
    // Can only complete accepted bookings
    if (booking.status !== "accepted") {
      res.status(400);
      throw new Error("Can only complete accepted bookings");
    }
  } else if (userRole !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.status = status;
  await booking.save();

  // Calculate financials if booking is completed
  if (status === "completed") {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);
    const hours = endHour - startHour;
    const rate = booking.interpreter.hourlyRate || 0;
    const amount = hours * rate;

    // You might want to store this in a separate transactions collection
    // or add it to the booking document
    booking.financials = {
      hours,
      rate,
      amount,
      calculatedAt: new Date(),
    };
    await booking.save();
  }

  // Send notifications
  if (status === "cancelled") {
    // Notify interpreter if booking was accepted
    if (booking.interpreter) {
      await sendBookingStatusUpdate(booking, "cancelled");
    }
  } else if (status === "completed") {
    // Notify client
    await sendBookingStatusUpdate(booking, "completed");
  }

  res.json(booking);
});
