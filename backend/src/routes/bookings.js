import express from "express";
import {
  createBooking,
  getBookings,
  updateBooking,
  getAvailableSlots,
  getInterpreterBookings,
  getUserBookings,
} from "../controllers/bookings.js";
import { protect, interpreter } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/interpreter", protect, interpreter, getInterpreterBookings);
router.get("/user", protect, getUserBookings);
router.get("/available-slots", protect, getAvailableSlots);
router.patch("/:id", protect, updateBooking);

export default router;
