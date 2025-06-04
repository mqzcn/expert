import express from "express";
import {
  createBooking,
  getBookings,
  updateBooking,
  getAvailableSlots,
  getInterpreterBookings,
  getUserBookings,
  getBookedSlots,
  updateBookingStatus,
  createCheckoutSession,
} from "../controllers/bookings.js";
import { protect, interpreter } from "../middleware/auth.js";

const router = express.Router();

router.get("/booked-slots", protect, getBookedSlots);
router.get("/interpreter", protect, interpreter, getInterpreterBookings);
router.get("/user", protect, getUserBookings);
router.get("/available-slots", protect, getAvailableSlots);
router.get("/", protect, getBookings);

router.post("/", protect, createBooking);
router.post(
  "/create-checkout-session/:bookingId",
  protect,
  createCheckoutSession
);

router.patch("/:id/status", protect, updateBookingStatus);
router.patch("/:id", protect, updateBooking);

export default router;
