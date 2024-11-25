import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import {
  sendBookingNotification,
  sendBookingStatusUpdate,
} from "../utils/email.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { languageId, date, startTime, endTime } = req.body;

  // Create the booking
  const booking = await Booking.create({
    client: req.user._id,
    language: languageId,
    date,
    startTime,
    endTime,
    status: "pending",
  });

  // Find interpreters who speak this language
  const interpreters = await User.find({
    role: "interpreter",
    languages: languageId,
  });

  // Populate the created booking with client and language details
  const populatedBooking = await Booking.findById(booking._id)
    .populate("client", "name email")
    .populate("language", "name code");

  if (booking) {
    // Send notifications to all eligible interpreters
    await sendBookingNotification(interpreters, populatedBooking);
    res.status(201).json(populatedBooking);
  } else {
    res.status(400);
    throw new Error("Invalid booking data");
  }
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
    await sendBookingStatusUpdate(updatedBooking);
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
