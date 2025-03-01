import React from "react";

const aboutUs = [
  {
    category: "",
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
];

const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        About Us
      </h2>
      <div className="mt-12 space-y-12">
        {aboutUs.map((section, index) => (
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

export default AboutUs;
