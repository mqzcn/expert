import Stripe from "stripe";
import Booking from "../models/Booking.js";
import User from "../models/User.js"; // Needed for finding interpreters
import { sendBookingNotification } from "../utils/email.js"; // Needed for sending notifications
import asyncHandler from "express-async-handler";

// TODO: Replace with your actual Stripe secret key, ideally from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_STRIPE_SECRET_KEY");

// TODO: Replace with your actual webhook signing secret from the Stripe dashboard
// Ensure this is also an environment variable (e.g., STRIPE_WEBHOOK_SECRET)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_YOUR_STRIPE_WEBHOOK_SECRET";

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body needs to be the raw request body for signature verification
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log("Stripe webhook event received:", event.type);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const clientReferenceId = session.client_reference_id; // This should also be the bookingId

      console.log(`Processing checkout.session.completed for bookingId: ${bookingId} (from metadata) and client_reference_id: ${clientReferenceId}`);

      if (!bookingId) {
        console.error("Error: bookingId not found in session metadata.");
        // Return 200 to Stripe to prevent retries for this specific error,
        // as it's a configuration issue (metadata not set).
        res.status(200).json({ received: true, error: "BookingId missing in metadata" });
        return;
      }

      try {
        const booking = await Booking.findById(bookingId);

        if (booking) {
          if (booking.paymentStatus === "pending") {
            booking.paymentStatus = "paid";
            // Optional: Update overall booking status based on business logic.
            // For example, if payment means the booking is fully confirmed:
            // booking.status = "accepted";
            // Or, if an interpreter still needs to accept it, 'pending' might be appropriate.
            // For now, we only update paymentStatus.
            console.log(`Booking ${bookingId} paymentStatus updated to 'paid'.`);

            // Re-introduce notification logic
            // Populate booking with client and language details for the notification
            const populatedBooking = await Booking.findById(bookingId)
              .populate("client", "name email")
              .populate("language", "name code");

            if (populatedBooking) {
              // Find interpreters who speak this language
              const interpreters = await User.find({
                role: "interpreter",
                languages: populatedBooking.language._id, // Assumes language field stores the ID
              });

              if (interpreters.length > 0) {
                await sendBookingNotification(interpreters, populatedBooking);
                console.log(`Notifications sent to ${interpreters.length} interpreters for booking ${bookingId}.`);
              } else {
                console.log(`No interpreters found for language ${populatedBooking.language.name} for booking ${bookingId}.`);
              }
            } else {
              console.error(`Could not populate booking ${bookingId} for notifications.`);
            }

            await booking.save();
          } else {
            console.log(`Booking ${bookingId} already processed or paymentStatus is not 'pending' (current: ${booking.paymentStatus}).`);
          }
        } else {
          console.error(`Error: Booking not found with id: ${bookingId}`);
        }
      } catch (dbError) {
        console.error(`Error processing booking ${bookingId}:`, dbError);
        // Send 500 for database/internal errors to allow Stripe to retry
        res.status(500).json({ error: "Failed to process booking update." });
        return;
      }
      break;
    case "payment_intent.payment_failed":
      const paymentIntent = event.data.object;
      const chargeId = paymentIntent.latest_charge;
      console.log(`Payment failed for PaymentIntent: ${paymentIntent.id}, Charge: ${chargeId}`);
      // TODO: Optionally, update booking status to 'payment_failed' or notify user
      // const failedBookingId = paymentIntent.metadata?.bookingId; // If you add bookingId to PaymentIntent metadata
      // if (failedBookingId) {
      //   const bookingToUpdate = await Booking.findById(failedBookingId);
      //   if (bookingToUpdate) {
      //     bookingToUpdate.paymentStatus = 'failed';
      //     await bookingToUpdate.save();
      //   }
      // }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});
