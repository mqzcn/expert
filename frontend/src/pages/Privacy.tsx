import React from "react";

const privacyPolicy = [
  {
    category: "Privacy Policy",
    questions: [
      {
        question: "Effective Date",
        answer: "6th day of June, 2025",
      },
      {
        question: "Purpose",
        answer: `This Privacy Policy informs users of www.expertlanguage.co.uk of the following:
1. The personal data we will collect;
2. Use of collected data;
3. Who has access to the data collected;
4. The rights of Site users; and
5. The Site's cookie policy.`,
      },
      {
        question: "GDPR",
        answer: `We adhere to GDPR (EU Regulation 2016/679) and the UK Data Protection Act 2018.`,
      },
      {
        question: "Consent",
        answer: `By using our Site, you consent to this Privacy Policy.
You may withdraw your consent at any time by contacting Expert Language support via email.`,
      },
      {
        question: "Legal Basis for Processing",
        answer: `We process personal data under Article 6 of the GDPR based on:
1. User consent;
2. Legitimate interest (conduct translation/interpretation services);
3. Performance of a contract (necessary personal data required for service).`,
      },
      {
        question: "Personal Data We Collect",
        answer: `Data collected in a non-automatic way includes:
- First and last name
- Age
- Date of birth
- Sex
- Email address
- Phone number
- Address
- Payment information
- Auto fill data`,
      },
      {
        question: "How We Use Personal Data",
        answer: `Personal data is used for:
1. Communication
2. Booking translation/interpretation services`,
      },
      {
        question: "Who We Share Personal Data With",
        answer: `Employees: Accessible only to those who reasonably need it.
Third Parties: Payment processor (Stripe) for processing payment and booking data.
Other Disclosures: As required by law, legal proceedings, protection of legal rights, or potential sale of the company.`,
      },
      {
        question: "How Long We Store Personal Data",
        answer: `User data is stored until the purpose it was collected for has been achieved. You will be notified if your data is kept longer.`,
      },
      {
        question: "How We Protect Your Personal Data",
        answer: `We use strong browser encryption and secure facilities. Data is only accessible to employees/freelance contractors under strict confidentiality agreements.
However, the internet cannot be guaranteed 100% secure.`,
      },
      {
        question: "Your Rights as a User",
        answer: `Under the GDPR, you have the right to:
1. Be informed
2. Access
3. Rectification
4. Erasure
5. Restrict processing
6. Data portability
7. Object`,
      },
      {
        question: "Children",
        answer: `We do not knowingly collect data from children under 16 years old. If discovered, data will be deleted. Parents/guardians may contact us regarding this.`,
      },
      {
        question: "How to Access, Modify, Delete, or Challenge Data",
        answer: `To exercise your GDPR rights, please contact support:
expertlanguageinfo@gmail.com`,
      },
      {
        question: "How to Opt-Out of Data Collection",
        answer: `You can opt-out by contacting support or deleting your account.`,
      },
      {
        question: "Cookie Policy",
        answer: `We use functional cookies to remember your preferences. You can disable cookies in your browser, but this may affect your experience.`,
      },
      {
        question: "Modifications",
        answer: `We may amend this Privacy Policy as required by law or changes to our practices. The "Effective Date" will be updated. Users are encouraged to review this Policy periodically.`,
      },
      {
        question: "Complaints",
        answer: `If you have complaints about how we process your data, please contact us. You can also lodge a complaint with the UK Information Commissioner’s Office.`,
      },
      {
        question: "Contact Information",
        answer: `For questions or complaints, contact support:
expertlanguageinfo@gmail.com`,
      },
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Privacy Policy
      </h2>
      <div className="mt-12 space-y-12">
        {privacyPolicy.map((section, index) => (
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

export default PrivacyPolicy;
