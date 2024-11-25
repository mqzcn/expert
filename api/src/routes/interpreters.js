import express from "express";
import {
  getInterpreters,
  getInterpreterProfile,
  updateInterpreterLanguages,
  updateAvailability,
} from "../controllers/interpreters.js";
import { protect, interpreter } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getInterpreters);
router.get("/profile", protect, interpreter, getInterpreterProfile);
router.patch("/languages", protect, interpreter, updateInterpreterLanguages);
router.patch("/availability", protect, interpreter, updateAvailability);

export default router;
