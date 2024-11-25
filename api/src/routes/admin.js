import express from "express";
import {
  getAdminBookings,
  getUsers,
  updateUser,
  getClientCharges,
  getInterpreterEarnings,
  exportFinancialReport,
} from "../controllers/admin.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/bookings", protect, admin, getAdminBookings);
router.get("/users", protect, admin, getUsers);
router.patch("/users/:id", protect, admin, updateUser);
router.get("/client-charges", protect, admin, getClientCharges);
router.get("/interpreter-earnings", protect, admin, getInterpreterEarnings);
router.get("/export-financials", protect, admin, exportFinancialReport);

export default router;
