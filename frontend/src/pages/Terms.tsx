import React from "react";

const terms = [
  {
    category: "Terms and Conditions",
    questions: [
      {
        question: "Introduction",
        answer: `These terms and conditions (the "Terms and Conditions") govern the use of expertlanguage.co.uk (the "Site"). This Site is owned and operated by Expert Language Ltd. This Site is a translation and interpretation services.

By using this Site, you indicate that you have read and understand these Terms and Conditions and agree to abide by them at all times.

THESE TERMS AND CONDITIONS CONTAIN A DISPUTE RESOLUTION CLAUSE THAT IMPACTS YOUR RIGHTS ABOUT HOW TO RESOLVE DISPUTES. PLEASE READ IT CAREFULLY.`,
      },
      {
        question: "Intellectual Property",
        answer: `All content published and made available on our Site is the property of Expert Language Ltd and the Site's creators. This includes, but is not limited to images, text, logos, documents, downloadable files and anything that contributes to the composition of our Site.`,
      },
      {
        question: "Accounts",
        answer: `When you create an account on our Site, you agree to the following:
- You are solely responsible for your account and the security and privacy of your account, including passwords or sensitive information attached to that account; and
- All personal information you provide to us through your account is up to date, accurate, and truthful and that you will update your personal information if it changes.

We reserve the right to suspend or terminate your account if you are using our Site illegally or if you violate these Terms and Conditions.`,
      },
      {
        question: "Sale of Services",
        answer: `These Terms and Conditions govern the sale of services available on our Site.

We are under a legal duty to supply goods that match the description of the good(s) you order on our Site.

The following services are available on our Site:
- Translation Service
- Interpretation Service
- Document Translation Service
- Face-to-face Translation/Interpretation Service

The services will be paid for in full when the services are ordered.

These Terms and Conditions apply to all the services that are displayed on our Site at the time you access it.

All information, descriptions, or images that we provide about our services are as accurate as possible. However, we are not legally bound by such information, descriptions, or images as we cannot guarantee the accuracy of all services we provide.

You agree to purchase services from our Site at your own risk.

We reserve the right to modify, reject or cancel your order whenever it becomes necessary.

If we cancel your order and have already processed your payment, we will give you a refund equal to the amount you paid.

You agree that it is your responsibility to monitor your payment instrument to verify receipt of any refund.`,
      },
      {
        question: "Subscriptions",
        answer: `Your subscription does not automatically renew. You will be notified before your next payment is due and must authorise that payment in order for your subscription to continue.

To cancel your subscription, please follow these steps: Any subscription can only be cancelled within 14 calendar days of the payment date.`,
      },
      {
        question: "Payments",
        answer: `We accept the following payment methods on our Site:
- Credit Card
- PayPal
- Debit
- Direct Debit

When you provide us with your payment information, you authorise our use of and access to the payment instrument you have chosen to use.

By providing us with your payment information, you authorise us to charge the amount due to this payment instrument.

If we believe your payment has violated any law or these Terms and Conditions, we reserve the right to cancel or reverse your transaction.`,
      },
      {
        question: "Right to Cancel and Receive Reimbursement",
        answer: `If you are a customer living in the United Kingdom or the European Union you have the right to cancel your contract to purchase services from us within 14 days without giving notice.

The cancellation period will end 14 days from the date of purchase when you purchased a service.

To exercise your right to cancel you must inform us of your decision to cancel within the cancellation period.

To cancel, click on Cancel Subscription where appropriate in your account settings. You may use a copy of the Cancellation Form, found at the end of these Terms and Conditions, but you are not required to do so.`,
      },
      {
        question: "Exclusions from Right to Cancel",
        answer: `The right to cancel does not apply to:
- Goods or services, other than the supply of water, gas, electricity, or district heating, where the price depends upon fluctuations in the financial market that we cannot control and that may occur during the cancellation period.
- Services that the customer has requested for the purpose of carrying out urgent repairs or maintenance.
- Newspapers, magazines, or periodicals, except for subscriptions to such publications.
- Accommodation, transport of goods, vehicle rental services, catering, or services related to leisure activities, if the contract includes a specific date or period of performance.`,
      },
      {
        question: "Effects of Cancellation",
        answer: `If you requested the performance of services begin during the cancellation period, you are required to pay us an amount which is in proportion to what has been performed until you have communicated to us your decision to cancel this contract.

We will reimburse to you any amount you have paid above this proportionate payment.

We will make the reimbursement using the same form of payment as you used for the initial purchase unless you have expressly agreed otherwise.

You will not incur any fees because of the reimbursement.

This right to cancel and to reimbursement is not affected by any return or refund policy we may have.`,
      },
      {
        question: "Refunds",
        answer: `Refunds for Services:

We provide refunds for services sold on our Site as follows:

The services will be fully refunded if the services are cancelled at least 48 hours before the services were scheduled to be provided.`,
      },
      {
        question: "Consumer Protection Law",
        answer: `Where the Sale of Goods Act 1979, the Consumer Rights Act 2015, or any other consumer protection legislation in your jurisdiction applies and cannot be excluded, these Terms and Conditions will not limit your legal rights and remedies under that legislation.

These Terms and Conditions will be read subject to the mandatory provisions of that legislation. If there is a conflict between these Terms and Conditions and that legislation, the mandatory provisions of the legislation will apply.`,
      },
      {
        question: "Limitation of Liability",
        answer: `Expert Language Ltd and our directors, officers, agents, employees, subsidiaries, and affiliates will not be liable for any actions, claims, losses, damages, liabilities and expenses including legal fees from your use of the Site.`,
      },
      {
        question: "Updates to these Terms and Conditions",
        answer: `We reserve the right to update or modify these Terms and Conditions at any time without prior notice.

We will notify you of significant changes through the Site or other communication channels.

Your continued use of the Site after the posting of any amendments constitutes acceptance of the updated Terms and Conditions.`,
      },
    ],
  },
];

const Terms = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Terms and Conditions
      </h2>
      <div className="mt-12 space-y-12">
        {terms.map((section, index) => (
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

export default Terms;
