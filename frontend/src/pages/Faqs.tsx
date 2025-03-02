import React from "react";

const faqs = [
  {
    category: "General Questions",
    questions: [
      {
        question: "What is Expert Language?",
        answer:
          "Expert Language is an online platform that connects clients seeking translation and interpreting services with professional interpreters. Our service facilitates booking, scheduling, and conducting interpretation sessions through a streamlined online process.",
      },
      {
        question: "How does Expert Language work?",
        answer:
          "Our platform works as a marketplace connecting clients who need interpreting services with qualified interpreters. Clients can book appointments for specific languages, and interpreters who offer those languages will be notified of available opportunities. Once an interpreter accepts a booking, they provide a meeting link, and the session can proceed at the scheduled time.",
      },
    ],
  },
  {
    category: "For Clients",
    questions: [
      {
        question: "How do I register as a client?",
        answer:
          "1. Visit expertlanguage.co.uk\n2. Click on 'Sign Up' or 'Register'\n3. Select 'Client Account'\n4. Complete the registration form with your details\n5. Submit your registration\n6. Wait for account activation by an Expert Language administrator\n7. Once activated, you'll receive a confirmation email.",
      },
      {
        question: "How do I book an interpreting service?",
        answer:
          "1. Log in to your client account\n2. Navigate to 'Book Appointment'\n3. Specify the language you need\n4. Select the date and time for your appointment\n5. Provide any additional details about the interpreting needs\n6. Submit your booking request\n7. Wait for an interpreter to accept your booking.",
      },
      {
        question: "How will I know when an interpreter accepts my booking?",
        answer:
          "You will receive a notification via email and on your dashboard when an interpreter accepts your booking. The notification will include the interpreter's profile information and the meeting link they've provided for the scheduled session.",
      },
      {
        question: "Can I cancel a booking?",
        answer:
          "Yes, you can cancel a booking through your dashboard:\n1. Log in to your account\n2. Go to 'My Bookings'\n3. Find the booking you wish to cancel\n4. Click on 'Cancel Booking'\nPlease refer to our terms of service for any cancellation policies or fees that may apply.",
      },
      {
        question: "What if no interpreter is available for my requested time?",
        answer:
          "If no interpreter accepts your booking within a reasonable timeframe, you will be notified. You can then:\n- Modify your booking to a different time\n- Contact our support team for assistance\n- Check if emergency or urgent services are available",
      },
    ],
  },
  {
    category: "For Interpreters",
    questions: [
      {
        question: "How do I register as an interpreter?",
        answer:
          "1. Visit expertlanguage.co.uk\n2. Click on 'Sign Up' or 'Register'\n3. Select 'Interpreter Account'\n4. Complete the registration form with your details\n5. Submit your registration\n6. Wait for account activation by an Expert Language administrator\n7. Once activated, you'll receive a confirmation email.",
      },
      {
        question: "How do I get notified of available bookings?",
        answer:
          "Once your account is activated, you will receive notifications for booking requests that match your language capabilities. Notifications are sent via:\n- Email\n- In-platform notifications",
      },
      {
        question: "How do I accept a booking?",
        answer:
          "1. Log in to your interpreter account\n2. Go to 'Available Bookings' or check your notifications\n3. Review the booking details including date, time, and language\n4. Click 'Accept Booking' if you want to take the assignment\n5. Provide a meeting link (Zoom, Microsoft Teams, etc.)\n6. Confirm your acceptance",
      },
      {
        question: "What platform should I use for the meeting link?",
        answer:
          "You can use any professional video conferencing platform, with Zoom and Microsoft Teams being the most common options. Ensure that:\n1. The link is valid for the scheduled time\n2. The meeting settings allow for client access without special permissions\n3. You've tested the link, your equipment and internet connection before sharing it",
      },
      {
        question: "How do I update my language capabilities?",
        answer:
          "1. Log in to your interpreter account\n2. Scroll to 'My Languages'\n3. Add or remove languages as needed",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "What browsers are compatible with Expert Language?",
        answer:
          "Expert Language works best with the latest versions of:\n1. Google Chrome\n2. Mozilla Firefox\n3. Safari\n4. Microsoft Edge",
      },
      {
        question: "What should I do if I encounter technical issues?",
        answer:
          "If you experience technical difficulties:\n1. Try refreshing the page\n2. Clear your browser cache and cookies\n3. Try using a different browser\n4. Check your internet connection\n5. If problems persist, contact our support team via email",
      },
      {
        question: "Is the platform mobile-friendly?",
        answer:
          "Yes, Expert Language is designed to work on mobile devices, tablets, and desktop computers. However, for interpreting sessions, we recommend using a device with a larger screen and stable internet connection for the best experience.",
      },
    ],
  },
];

const Faqs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Frequently Asked Questions
      </h2>
      <div className="mt-12 space-y-12">
        {faqs.map((section, index) => (
          <div key={index}>
            <h3 className="text-2xl font-semibold text-indigo-600">
              {section.category}
            </h3>
            <div className="mt-6 space-y-6">
              {section.questions.map((faq, i) => (
                <div key={i} className="border-b border-gray-200 pb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h4>
                  <p className="mt-2 text-gray-600 whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;
