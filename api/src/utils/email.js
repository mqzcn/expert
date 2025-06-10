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
      from: "Expert Language <noreply@expertlanguage.co.uk>",
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

export const sendPasswordChangeConfirmationEmail = async (
  userEmail,
  userName
) => {
  try {
    const result = await resend.emails.send({
      from: "Expert Language <noreply@expertlanguage.co.uk>",
      to: userEmail,
      subject: "Expert Language - Your Password Has Been Changed",
      html: `
        <h2>Password Successfully Changed</h2>
        <p>Hello ${userName},</p>
        <p>This email confirms that the password for your Expert Language account has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,</p>
        <p>The Expert Language Team</p>
      `,
    });
    console.log(
      "Password change confirmation email sent successfully:",
      result
    );
    if (result.error) {
      console.error(
        "Resend error when sending password change confirmation email:",
        result.error
      );
    }
  } catch (error) {
    console.error({
      message: "Error sending password change confirmation email",
      recipientEmail: userEmail,
      errorDetails: error,
    });
  }
};

export const sendPasswordResetEmail = async (userEmail, token, userName) => {
  try {
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendURL}/reset-password?token=${token}`;

    const result = await resend.emails.send({
      from: "Expert Language <noreply@expertlanguage.co.uk>",
      to: userEmail,
      subject: "Expert Language - Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The Expert Language Team</p>
      `,
    });
    console.log("Password reset email sent successfully:", result);
    if (result.error) {
      console.error(
        "Resend error when sending password reset email:",
        result.error
      );
    }
  } catch (error) {
    console.error({
      message: "Error sending password reset email",
      recipientEmail: userEmail,
      errorDetails: error,
    });
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const result = await resend.emails.send({
      from: "Expert Language <noreply@expertlanguage.co.uk>",
      to: userEmail,
      subject: "Welcome to Expert Language!",
      html: `
        <h2>Welcome to Expert Language, ${userName}!</h2>
        <p>Thank you for signing up. We're excited to have you on board.</p>
        <p>You can now log in to your account and explore our services.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,</p>
        <p>The Expert Language Team</p>
      `,
    });
    console.log("Welcome email sent successfully:", result);
    if (result.error) {
      console.error("Resend error when sending welcome email:", result.error);
    }
  } catch (error) {
    console.error({
      message: "Error sending welcome email",
      recipientEmail: userEmail,
      errorDetails: error,
    });
    // Optionally rethrow or handle more specifically if needed
    // For now, just logging as per other functions
  }
};

export const sendBookingConfirmationToClient = async (booking) => {
  try {
    if (!booking || !booking.client || !booking.client.email) {
      console.error(
        "Invalid booking or client details for sending confirmation to client."
      );
      return;
    }
    if (!booking.language || !booking.language.name) {
      console.error(
        "Booking language details missing for sending confirmation to client."
      );
      // Fallback if language name is missing, though it should be populated
      booking.language = { name: "the requested language" };
    }

    // Ensure date is valid before trying to format it
    const bookingDate = booking.date
      ? new Date(booking.date).toLocaleDateString()
      : "Not specified";
    const startTime = booking.startTime || "Not specified";
    const endTime = booking.endTime || "Not specified";

    const result = await resend.emails.send({
      from: "Expert Language <noreply@expertlanguage.co.uk>",
      to: booking.client.email,
      subject: "Your Booking with Expert Language is Confirmed!",
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${booking.client.name || "Client"},</p>
        <p>Thank you for your booking with Expert Language. We are pleased to confirm that your booking has been successfully processed.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Language:</strong> ${booking.language.name}</li>
          <li><strong>Date:</strong> ${bookingDate}</li>
          <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        </ul>

        <p>We are now in the process of assigning a suitable interpreter for your session.</p>
        <p><strong>You will receive a separate email containing the meeting link and interpreter details once an interpreter has accepted your booking.</strong></p>

        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Sincerely,</p>
        <p>The Expert Language Team</p>
      `,
    });
    console.log("Booking confirmation email sent to client:", result);
    if (result.error) {
      console.error(
        "Resend error when sending booking confirmation to client:",
        result.error
      );
    }
  } catch (error) {
    console.error({
      message: "Error sending booking confirmation email to client",
      recipientEmail: booking?.client?.email,
      bookingId: booking?._id,
      errorDetails: error,
    });
  }
};

export const sendBookingStatusUpdate = async (booking, status) => {
  try {
    let subject, html;
    let recipientEmail = booking?.client?.email; // Default recipient is client unless specified

    // Ensure necessary details are present for "accepted" status
    if (status === "accepted") {
      if (!booking?.interpreter?.name) {
        console.error(
          "Interpreter details missing for 'accepted' booking status email."
        );
        // Potentially fallback or don't send, or send a modified email
        // For now, we'll let it proceed and it will show "undefined" or similar if data is missing.
      }
      if (!booking?.meetingLink) {
        console.error(
          "Meeting link missing for 'accepted' booking status email."
        );
        // Crucial for this email, perhaps should not send if missing.
        // For now, we'll let it proceed.
      }
    }

    switch (status) {
      case "accepted":
        subject = "Your Booking is Confirmed and Interpreter Assigned!";
        html = `
          <h2>Booking Confirmed & Interpreter Assigned</h2>
          <p>Dear ${booking?.client?.name || "Client"},</p>
          <p>Great news! An interpreter has been assigned to your booking for ${
            booking?.language?.name
          }.</p>
          
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Language:</strong> ${
              booking?.language?.name || "N/A"
            }</li>
            <li><strong>Date:</strong> ${
              booking?.date
                ? new Date(booking.date).toLocaleDateString()
                : "N/A"
            }</li>
            <li><strong>Time:</strong> ${booking?.startTime || "N/A"} - ${
          booking?.endTime || "N/A"
        }</li>
            <li><strong>Interpreter:</strong> ${
              booking?.interpreter?.name || "Details to follow"
            }</li>
          </ul>

          <h3>Meeting Link:</h3>
          <p>Please use the following link to join your session at the scheduled time:</p>
          <p><a href="${booking?.meetingLink || "#"}">${
          booking?.meetingLink || "Link will be provided if missing"
        }</a></p>
          <p>${
            !booking?.meetingLink
              ? "If the link is missing here, please expect a follow-up or contact support."
              : ""
          }</p>

          <p>If you have any questions, please contact our support team.</p>
          <p>Sincerely,</p>
          <p>The Expert Language Team</p>
        `;
        recipientEmail = booking?.client?.email;
        break;
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
        // Re-evaluating recipient for "cancelled":
        // The controller updateBookingStatus has:
        // if (status === "cancelled") { if (booking.interpreter) { await sendBookingStatusUpdate(booking, "cancelled"); } }
        // This means sendBookingStatusUpdate for "cancelled" is only called if an interpreter IS assigned,
        // and in that case, the email should go to the interpreter.
        if (status === "cancelled") {
          // This function is called only when interpreter needs notification for cancellation
          recipientEmail = booking?.interpreter?.email;
        }
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
          `
              : ""
          }
        `;
        recipientEmail = booking?.client?.email; // Client gets completion email
        break;
      default:
        // Avoid sending generic "status updated" if it was "accepted" and handled above.
        if (status === "accepted") {
          // Should not happen if switch case is ordered correctly
          console.log(
            "Status 'accepted' already handled, not sending default email."
          );
          return;
        }
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
      from: "Expert Language <noreply@expertlanguage.co.uk>",
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
      from: "Expert Language <noreply@expertlanguage.co.uk>",
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
