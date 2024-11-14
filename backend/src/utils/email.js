import { Resend } from "resend";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not defined in environment variables");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingNotification = async (interpreters, booking) => {
  try {
    if (!interpreters || interpreters.length === 0) {
      console.log("No interpreters to notify");
      return;
    }

    const result = await resend.emails.send({
      from: "Expert Language <onboarding@resend.dev>",
      to: interpreters.map((i) => i.email),
      subject: "New Translation Booking Available",
      html: `
        <h2>New Translation Booking</h2>
        <p>A new booking is available for ${booking.language.name}</p>
        <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
        <p>Time: ${booking.startTime} - ${booking.endTime}</p>
        <p>Client: ${booking.client.name}</p>
        <p>Please log in to your dashboard to accept the booking.</p>
      `,
    });
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Error sending booking notification:", error);
  }
};

export const sendBookingStatusUpdate = async (booking) => {
  try {
    const result = await resend.emails.send({
      from: "Expert Language <onboarding@resend.dev>",
      to: booking.client.email,
      subject: "Your Booking Has Been Accepted",
      html: `
        <h2>Booking Accepted</h2>
        <p>Your translation booking has been accepted.</p>
        <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
        <p>Time: ${booking.startTime} - ${booking.endTime}</p>
        <p>Language: ${booking.language.name}</p>
        <p>Meeting Link: <a href="${booking.meetingLink}">${
        booking.meetingLink
      }</a></p>
      `,
    });
    console.log("Status update email sent:", result);
  } catch (error) {
    console.error("Error sending status update:", error);
  }
};

export const sendMeetingLinkNotification = async (booking) => {
  try {
    const result = await resend.emails.send({
      from: "Expert Language <onboarding@resend.dev>",
      to: booking.client.email,
      subject: "Translation Session Meeting Link",
      html: `
        <h2>Your Translation Session is Confirmed</h2>
        <p>Your session has been confirmed for ${new Date(
          booking.date
        ).toLocaleDateString()} at ${booking.startTime}</p>
        <p>Meeting Link: <a href="${booking.meetingLink}">${
        booking.meetingLink
      }</a></p>
        <p>Please join the meeting at the scheduled time.</p>
      `,
    });
    console.log("Meeting link email sent:", result);
  } catch (error) {
    console.error("Error sending meeting link:", error);
  }
};
