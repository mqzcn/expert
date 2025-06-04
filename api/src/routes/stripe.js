import express from "express";
import { handleStripeWebhook } from "../controllers/stripeController.js";

const router = express.Router();

// Stripe requires the raw body to construct the event.
// This middleware should be applied before any JSON parsing middleware if used globally.
// Here, we apply it specifically to this route.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
