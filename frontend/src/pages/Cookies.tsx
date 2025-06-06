import React from "react";

const cookiesPolicy = [
  {
    category: "Cookies Policy",
    questions: [
      {
        question: "What Are Cookies?",
        answer: `A cookie is a small file stored on your device that helps us enhance your experience on our Site. They allow us to recognize your device and store preferences and other information.`,
      },
      {
        question: "How We Use Cookies",
        answer: `We use cookies to:
- Enable core functionality of our Site
- Analyze Site usage to improve performance and user experience
- Remember your preferences and settings
- Provide relevant content and advertising

By using our Site, you consent to our use of cookies.`,
      },
      {
        question: "Managing Cookies",
        answer: `You can control and manage cookies through your browser settings. Most browsers allow you to:
- View what cookies are stored on your device
- Delete cookies
- Block cookies from specific websites
- Block all cookies entirely

Please note that disabling cookies may affect the functionality and performance of our Site.`,
      },
      {
        question: "Third-Party Cookies",
        answer: `We may use third-party services that set their own cookies on your device when you interact with our Site. These third-party cookies are governed by the privacy policies of the respective third parties.`,
      },
      {
        question: "Changes to This Cookies Policy",
        answer: `We may update this Cookies Policy from time to time. Changes will be posted on this page with an updated effective date.

Your continued use of our Site after any changes constitutes your acceptance of the updated Cookies Policy.`,
      },
      {
        question: "Contact Us",
        answer: `If you have any questions about our use of cookies, please contact us at:

expertlanguageinfo@gmail.com`,
      },
    ],
  },
];

const CookiesPolicy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Cookies Policy
      </h2>
      <div className="mt-12 space-y-12">
        {cookiesPolicy.map((section, index) => (
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

export default CookiesPolicy;
