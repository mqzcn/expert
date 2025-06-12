import asyncHandler from 'express-async-handler'; // For consistent error handling
import { sendContactFormEmailToAdmins } from '../utils/email.js'; // Adjust path if needed

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
export const handleContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    res.status(400); // Bad Request
    throw new Error('Please fill in all fields.');
  }

  // More specific email validation (optional, as frontend should also validate)
  // A simple regex for basic email format check, or use a library like validator.js
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address.');
  }

  try {
    // The sendContactFormEmailToAdmins function is async but we are not awaiting it here
    // if we want to respond to the user immediately.
    // However, if it's critical to know if the email sending process itself had an immediate error
    // before responding to the user, you might await it.
    // For this implementation, let's assume sendContactFormEmailToAdmins handles its own errors
    // and we respond success to the user once the request is validated and handed off.
    // If sendContactFormEmailToAdmins were to throw an error that needs to change the client response,
    // then awaiting it would be necessary. The current implementation of sendContactFormEmailToAdmins
    // does not throw but logs errors.
    sendContactFormEmailToAdmins({
      senderName: name,
      senderEmail: email,
      subject: subject,
      message: message,
    });
    // Assuming the hand-off to the email function is enough to claim success for the user.
    // The actual email delivery will be asynchronous.
    res.status(200).json({ success: true, message: 'Message sent successfully! Our team will get back to you shortly.' });
  } catch (error) {
    // This catch block would only be hit if there's an error *before* or *within* the synchronous part of
    // calling sendContactFormEmailToAdmins, or if sendContactFormEmailToAdmins was awaited and threw.
    // Since sendContactFormEmailToAdmins currently doesn't throw, this primarily catches other unexpected errors.
    console.error('Error in handleContactForm:', error);
    res.status(500);
    throw new Error('Failed to process your message. Please try again later.');
  }
});
