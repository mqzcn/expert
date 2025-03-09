import React from "react";

// ## Accessibility Features

// Our platform includes the following accessibility features:

// ### Navigation and Structure
// - Clear and consistent navigation throughout the site
// - Logical heading structure to facilitate screen reader navigation
// - Proper use of ARIA landmarks to identify regions of the page
// - Skip navigation links to bypass repetitive content
// - Breadcrumb trails for enhanced navigation

// ### Visual Design
// - Text and background color combinations that meet contrast requirements
// - Resizable text without loss of functionality
// - No content that flashes more than three times per second
// - Focus indicators for keyboard navigation
// - Responsive design that adapts to different viewport sizes

// ### Forms and Interactive Elements
// - All form fields have associated labels
// - Error messages are clearly identified and explained
// - Form validation provides clear guidance on how to correct errors
// - Sufficient time to complete forms with options to extend time limits
// - No time-dependent responses required unless necessary

// ### Content and Text
// - Clear, simple language where possible
// - Explanations for specialized terminology
// - Alternative text for all meaningful images
// - Captions and transcripts for video content
// - Text alternatives for complex visualizations

// ### Input Methods
// - Full keyboard accessibility for all functions
// - Support for screen readers (JAWS, NVDA, VoiceOver, TalkBack)
// - Compatibility with speech recognition software
// - Adjustable timing for those who need more time to complete actions
// - Touch-friendly elements with adequate spacing

// ## Assistive Technology Compatibility

// Expert Language is designed to be compatible with the following assistive technologies:

// - Screen readers (JAWS, NVDA, VoiceOver, TalkBack)
// - Speech recognition software
// - Screen magnifiers
// - Alternative keyboards and input devices
// - Browser extensions that modify content for accessibility needs

// ## Known Issues and Workarounds

// While we strive for complete accessibility, we acknowledge the following known issues:

// 1. **Video meeting integration**: Some third-party video conferencing platforms may have varying levels of accessibility support. We recommend:
//    - Using Zoom or Microsoft Teams which have stronger accessibility features
//    - Testing your preferred platform with your assistive technology before sessions
//    - Contacting support if you need accommodation for video meetings

// 2. **Calendar selection**: Some users with motor disabilities may find the date picker challenging. Alternative methods:
//    - Use keyboard navigation (Tab and arrow keys) to move through dates
//    - Enter dates manually in the format DD/MM/YYYY
//    - Contact support for assistance with booking if needed

// ## Feedback and Contact Information

// We welcome your feedback on the accessibility of Expert Language. Please let us know if you encounter accessibility barriers:

// - Email: accessibility@expertlanguage.co.uk
// - Phone: [Your phone number]
// - Postal address: [Your postal address]

// We try to respond to feedback within 3 business days.

// ## Formal Compliance Status

// Expert Language is partially conformant with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.

// ## Assessment Approach

// Expert Language's accessibility has been assessed through:

// - Internal evaluation using automated testing tools
// - Manual testing with assistive technologies
// - User testing with individuals who use assistive technologies
// - Periodic third-party accessibility audits

// ## Technical Specifications

// Accessibility of Expert Language relies on the following technologies to work:
// - HTML
// - WAI-ARIA
// - CSS
// - JavaScript

// These technologies are relied upon for conformance with the accessibility standards used.

// ## Browser and Technology Compatibility

// Expert Language is designed to be compatible with:
// - Current versions of Chrome, Firefox, Safari, and Edge
// - iOS 14+ and Android 10+
// - Common screen readers including JAWS, NVDA, VoiceOver, and TalkBack

// ## Additional Resources

// For more information about web accessibility, we recommend:
// - [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
// - [WebAIM](https://webaim.org/)
// - [AbilityNet](https://abilitynet.org.uk/)
// - [Accessible Web Design](https://www.accessibility-developer-guide.com/)

// ## Continuous Improvement

// We are committed to ongoing improvement of our accessibility efforts. Our accessibility roadmap includes:

// 1. Regular accessibility audits
// 2. Ongoing team training on accessible design and development
// 3. User testing with people who use assistive technologies
// 4. Incorporation of feedback from users with disabilities
// 5. Regular updates to keep pace with evolving accessibility standards and technologies

// This statement was last updated on March 1, 2025.

const accessibility = [
  {
    category: "",
    questions: [
      {
        question: "Our Commitment to Accessibility",
        answer:
          "Expert Language is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.",
      },
      {
        question: "Measures Taken to Support Accessibility",
        answer:
          "- We've developed our website in compliance with WCAG 2.1 (Web Content Accessibility Guidelines) Level AA standards\n- We regularly conduct user testing with assistive technologies\n- We provide accessibility training for our development and content teams",
      },
    ],
  },
  {
    category: "Accessibility Features",
    questions: [
      {
        question: "Our platform includes the following accessibility features",
        answer:
          "- Clear and consistent navigation throughout the site\n- Logical heading structure to facilitate screen reader navigation\n- Proper use of ARIA landmarks to identify regions of the page\n- Skip navigation links to bypass repetitive content\n",
      },
      {
        question: "Measures Taken to Support Accessibility",
        answer:
          "- We've developed our website in compliance with WCAG 2.1 (Web Content Accessibility Guidelines) Level AA standards\n- We regularly conduct user testing with assistive technologies\n- We provide accessibility training for our development and content teams",
      },
    ],
  },
];

const Accessibility = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
        Accessibility Statement for Expert Language
      </h2>
      <div className="mt-12 space-y-12">
        {accessibility.map((section, index) => (
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

export default Accessibility;
