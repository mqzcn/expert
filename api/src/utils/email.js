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
    console.error({
      message: "Error sending booking notification",
      recipientEmails: interpreters.map((i) => i.email),
      bookingId: booking?._id,
      errorDetails: error,
    });
  }
};

export const sendBookingStatusUpdate = async (booking, status) => {
  try {
    let subject, html;

    switch (status) {
      case "cancelled":
        subject = "Booking Cancelled";
        html = `
          <h2>Booking Cancelled</h2>
          <p>A booking has been cancelled:</p>
          <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
          <p>Time: ${booking.startTime} - ${booking.endTime}</p>
          <p>Language: ${booking.language.name}</p>
          <p>Client: ${booking.client.name}</p>
        `;
        break;
      case "completed":
        subject = "Booking Completed";
        html = `
          <h2>Booking Completed</h2>
          <p>Your translation session has been completed.</p>
          <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
          <p>Time: ${booking.startTime} - ${booking.endTime}</p>
          <p>Language: ${booking.language.name}</p>
          <p>Interpreter: ${booking.interpreter.name}</p>
          ${
            booking.financials
              ? `
            <p>Duration: ${booking.financials.hours} hours</p>
            <p>Rate: £${booking.financials.rate}/hour</p>
            <p>Total Amount: £${booking.financials.amount}</p>
          `
              : ""
          }
        `;
        break;
      default:
        subject = "Booking Status Update";
        html = `
          <h2>Booking Status Updated</h2>
          <p>Your booking status has been updated to: ${status}</p>
          <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
          <p>Time: ${booking.startTime} - ${booking.endTime}</p>
          <p>Language: ${booking.language.name}</p>
        `;
    }

    const result = await resend.emails.send({
      from: "Expert Language <onboarding@resend.dev>",
      to:
        status === "cancelled"
          ? booking.interpreter.email
          : booking.client.email,
      subject,
      html,
    });
    console.log("Status update email sent:", result);
  } catch (error) {
    console.error({
      message: "Error sending status update email",
      recipientEmail:
        status === "cancelled"
          ? booking?.interpreter?.email
          : booking?.client?.email,
      bookingId: booking?._id,
      status: status,
      errorDetails: error,
    });
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
    console.error({
      message: "Error sending meeting link email",
      recipientEmail: booking?.client?.email,
      bookingId: booking?._id,
      errorDetails: error,
    });
  }
};
