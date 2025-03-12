import React from "react";

const careers = [
  {
    category: "Careers @ Expert Language",
    questions: [
      {
        question: "",
        answer:
          "We are currently not hiring for any positions at Expert Language.\n\nHowever, keep an eye on this page as we'll post job openings here.",
      },
    ],
  },
];

const Careers = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Careers
      </h2>
      <div className="mt-12 space-y-12">
        {careers.map((section, index) => (
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

export default Careers;
