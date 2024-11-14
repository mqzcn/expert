import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("client", "name email")
    .populate("interpreter", "name email hourlyRate")
    .populate("language", "name code")
    .sort("-createdAt");
  res.json(bookings);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .populate("languages", "name code")
    .select("-password");
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { hourlyRate, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true }
  )
    .populate("languages", "name code")
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const getClientCharges = asyncHandler(async (req, res) => {
  const { clientId, startDate, endDate } = req.query;

  const bookings = await Booking.find({
    client: clientId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: { $in: ["completed", "accepted"] },
  })
    .populate("interpreter", "name hourlyRate")
    .populate("language", "name");

  const charges = bookings.map((booking) => {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);
    const hours = endHour - startHour;
    const amount = hours * (booking.interpreter?.hourlyRate || 0);

    return {
      date: booking.date,
      interpreter: booking.interpreter?.name,
      language: booking.language.name,
      hours,
      rate: booking.interpreter?.hourlyRate || 0,
      amount,
    };
  });

  const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);

  res.json({
    charges,
    totalAmount,
    bookingCount: charges.length,
  });
});

export const getInterpreterEarnings = asyncHandler(async (req, res) => {
  const { interpreterId, startDate, endDate } = req.query;

  const bookings = await Booking.find({
    interpreter: interpreterId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: { $in: ["completed", "accepted"] },
  })
    .populate("client", "name")
    .populate("language", "name");

  const interpreter = await User.findById(interpreterId);
  const hourlyRate = interpreter?.hourlyRate || 0;

  const earnings = bookings.map((booking) => {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);
    const hours = endHour - startHour;
    const amount = hours * hourlyRate;

    return {
      date: booking.date,
      client: booking.client?.name,
      language: booking.language.name,
      hours,
      rate: hourlyRate,
      amount,
    };
  });

  const totalAmount = earnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );

  res.json({
    earnings,
    totalAmount,
    bookingCount: earnings.length,
  });
});
