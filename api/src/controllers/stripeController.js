import Stripe from "stripe";
import Booking from "../models/Booking.js";
import User from "../models/User.js"; // Needed for finding interpreters
import {
  sendBookingNotification,
  sendBookingConfirmationToClient,
} from "../utils/email.js"; // Needed for sending notifications
import asyncHandler from "express-async-handler";

// TODO: Replace with your actual Stripe secret key, ideally from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: Replace with your actual webhook signing secret from the Stripe dashboard
// Ensure this is also an environment variable (e.g., STRIPE_WEBHOOK_SECRET)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const clientReferenceId = session.client_reference_id;

      console.log(
        `Processing ${event.type} for bookingId: ${bookingId} (metadata), client_reference_id: ${clientReferenceId}, payment_status: ${session.payment_status}`
      );

      if (!bookingId) {
        console.error(
          "Error: bookingId not found in session metadata for checkout.session.completed."
        );
        res
          .status(200)
          .json({ received: true, error: "BookingId missing in metadata" });
        return;
      }

      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          console.error(
            `Error: Booking not found with id: ${bookingId} for event ${event.type}`
          );
          res.status(200).json({ received: true, error: "Booking not found" });
          return;
        }

        // Check payment status of the session
        if (session.payment_status === "paid") {
          if (booking.paymentStatus === "pending") {
            booking.paymentStatus = "paid";
            console.log(
              `Booking ${bookingId} paymentStatus updated to 'paid'.`
            );

            const populatedBooking = await Booking.findById(bookingId)
              .populate("client", "name email")
              .populate("language", "name code");

            if (populatedBooking) {
              const interpreters = await User.find({
                role: "interpreter",
                languages: populatedBooking.language._id,
              });
              if (interpreters.length > 0) {
                await sendBookingNotification(interpreters, populatedBooking);
                console.log(
                  `Notifications sent to ${interpreters.length} interpreters for booking ${bookingId}.`
                );
              } else {
                console.log(
                  `No interpreters found for language ${populatedBooking.language.name} for booking ${bookingId}.`
                );
              }
              // Notify the client
              if (populatedBooking.client && populatedBooking.client.email) {
                await sendBookingConfirmationToClient(populatedBooking);
                console.log(
                  `Booking confirmation email sent to client for booking ${bookingId}.`
                );
              } else {
                console.error(
                  `Client details not available for booking ${bookingId} to send booking confirmation.`
                );
              }
            } else {
              console.error(
                `Could not populate booking ${bookingId} for notifications after payment.`
              );
            }
            await booking.save();
          } else {
            console.log(
              `Booking ${bookingId} already processed or paymentStatus not 'pending' (current: ${booking.paymentStatus}). No action taken for 'paid' session.`
            );
          }
        } else if (
          session.payment_status === "unpaid" ||
          session.payment_status === "no_payment_required"
        ) {
          // 'no_payment_required' is less likely for paid bookings but good to cover.
          // 'unpaid' can happen if payment fails for some reason on a completed session.
          if (booking.paymentStatus !== "paid") {
            // Avoid overwriting an already successful payment
            booking.paymentStatus = "failed"; // Or a more specific status like 'unpaid'
            await booking.save();
            console.log(
              `Booking ${bookingId} paymentStatus updated to 'failed' due to session payment_status: ${session.payment_status}.`
            );
          } else {
            console.log(
              `Booking ${bookingId} is already 'paid'. No action taken for session payment_status: ${session.payment_status}.`
            );
          }
        } else {
          console.log(
            `Unhandled payment_status '${session.payment_status}' for checkout.session.completed for booking ${bookingId}.`
          );
        }
      } catch (dbError) {
        console.error(
          `Database error processing ${event.type} for booking ${bookingId}:`,
          dbError
        );
        res.status(500).json({ error: "Failed to process booking update." });
        return;
      }
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      console.log(
        `Processing ${event.type} for bookingId: ${bookingId} (metadata)`
      );

      if (!bookingId) {
        console.error(
          `Error: bookingId not found in session metadata for ${event.type}.`
        );
        res.status(200).json({
          received: true,
          error: "BookingId missing in metadata for async_payment_failed",
        });
        return;
      }

      try {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          if (booking.paymentStatus !== "paid") {
            // Don't overwrite if somehow paid via another means
            booking.paymentStatus = "failed";
            await booking.save();
            console.log(
              `Booking ${bookingId} paymentStatus updated to 'failed' due to ${event.type}.`
            );
          } else {
            console.log(
              `Booking ${bookingId} is already 'paid'. No action taken for ${event.type}.`
            );
          }
        } else {
          console.error(
            `Error: Booking not found with id: ${bookingId} for event ${event.type}`
          );
        }
      } catch (dbError) {
        console.error(
          `Database error processing ${event.type} for booking ${bookingId}:`,
          dbError
        );
        res.status(500).json({
          error: "Failed to process booking update for async_payment_failed.",
        });
        return;
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(
        `Observed ${event.type}: PaymentIntent ID ${
          paymentIntent.id
        }, Status: ${paymentIntent.status}. Checkout session ID: ${
          paymentIntent.invoice?.charge?.checkout_session_id ||
          paymentIntent.checkout_session_id ||
          "N/A"
        }`
      );
      // If you store paymentIntentId on your Booking, you could use:
      // const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
      // For now, just logging. More direct handling would require linking paymentIntent back to booking.
      // Checkout session metadata is generally more straightforward for this.
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event (unless already sent)
  res.status(200).json({ received: true });
});
