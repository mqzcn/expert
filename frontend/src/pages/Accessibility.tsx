import React from "react";

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
      {
        question: "Navigation and Structure",
        answer:
          "- Clear and consistent navigation throughout the site\n- Logical heading structure to facilitate screen reader navigation\n- Proper use of ARIA landmarks to identify regions of the page\n- Skip navigation links to bypass repetitive content\n- Breadcrumb trails for enhanced navigation",
      },
      {
        question: "Visual Design",
        answer:
          "Text and background color combinations that meet contrast requirements\n- Resizable text without loss of functionality\n- No content that flashes more than three times per second\n- Focus indicators for keyboard navigation\n- Responsive design that adapts to different viewport sizes",
      },
      {
        question: "Forms and Interactive Elements",
        answer:
          "- All form fields have associated labels\n- Error messages are clearly identified and explained\n- Form validation provides clear guidance on how to correct errors\n- Sufficient time to complete forms with options to extend time limits\n- No time-dependent responses required unless necessary",
      },
      {
        question: "Content and Text",
        answer:
          "- Clear, simple language where possible\n- Explanations for specialized terminology\n- Alternative text for all meaningful images\n- Captions and transcripts for video content\n- Text alternatives for complex visualizations",
      },
      {
        question: "Input Methods",
        answer:
          "- Full keyboard accessibility for all functions\n- Support for screen readers (JAWS, NVDA, VoiceOver, TalkBack)\n- Compatibility with speech recognition software\n- Adjustable timing for those who need more time to complete actions\n- Touch-friendly elements with adequate spacing",
      },
    ],
  },
  {
    category: "Assistive Technology Compatibility",
    questions: [
      {
        question:
          "Expert Language is designed to be compatible with the following assistive technologies",
        answer:
          "- Screen readers (JAWS, NVDA, VoiceOver, TalkBack)\n- Speech recognition software\n- Screen magnifiers\n- Alternative keyboards and input devices\n- Browser extensions that modify content for accessibility needs",
      },
    ],
  },
  {
    category: "Known Issues and Workarounds",
    questions: [
      {
        question:
          "While we strive for complete accessibility, we acknowledge the following known issues",
        answer:
          "1. **Video meeting integration**: Some third-party video conferencing platforms may have varying levels of accessibility support. We recommend:\n- Using Zoom or Microsoft Teams which have stronger accessibility features\n- Testing your preferred platform with your assistive technology before sessions\n- Contacting support if you need accommodation for video meetings",
      },
      {
        answer:
          "2. **Calendar selection**: Some users with motor disabilities may find the date picker challenging. Alternative methods:\n- Use keyboard navigation (Tab and arrow keys) to move through dates\n- Enter dates manually in the format DD/MM/YYYY\n- Contact support for assistance with booking if needed",
      },
    ],
  },
  {
    category: "Formal Compliance Status",
    questions: [
      {
        question:
          "Expert Language is partially conformant with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.",
        answer:
          "Expert Language's accessibility has been assessed through:\n- Internal evaluation using automated testing tools\n- Manual testing with assistive technologies\n- User testing with individuals who use assistive technologies\n- Periodic third-party accessibility audits",
      },
    ],
  },
  {
    category: "Technical Specifications",
    questions: [
      {
        question:
          "Accessibility of Expert Language relies on the following technologies to work:",
        answer:
          "- HTML\n- WAI-ARIA\n- CSS\n- JavaScript\nThese technologies are relied upon for conformance with the accessibility standards used.",
      },
    ],
  },
  {
    category: "Additional Resources",
    questions: [
      {
        question: "For more information about web accessibility, we recommend:",
        answer:
          "- Web Content Accessibility Guidelines (WCAG):  https://www.w3.org/WAI/standards-guidelines/wcag\n- WebAIM:  https://webaim.org\n- AbilityNet:  https://abilitynet.org.uk\n- Accessible Web Design:  https://www.accessibility-developer-guide.com",
      },
    ],
  },
  {
    category: "Continuous Improvement",
    questions: [
      {
        question:
          "We are committed to ongoing improvement of our accessibility efforts. Our accessibility roadmap includes:",
        answer:
          "1. Regular accessibility audits\n2. Ongoing team training on accessible design and development\n3. User testing with people who use assistive technologies\n4. Incorporation of feedback from users with disabilities\n5. Regular updates to keep pace with evolving accessibility standards and technologies",
      },
      {
        answer: "This statement was last updated on 01 March 2025.",
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
