import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  companionsOnly?: boolean;
}

const faqs: FAQItem[] = [
  {
    question: 'What time should I arrive?',
    answer:
      'Please arrive at the church by 10:30 AM, 30 minutes before the ceremony begins at 11:00 AM.',
  },
  {
    question: 'How do I get from the church to the reception?',
    answer:
      "The reception is at Lasa BBQ inside SM Fairview. From Mary the Queen Parish, it's approximately a 15-20 minute drive. You can use the Google Maps link provided in the directions section.",
  },
  {
    question: 'Is parking available?',
    answer: 'SM Fairview has ample parking space available for all guests.',
  },
  {
    question: 'Can I bring additional guests?',
    answer:
      'Yes! Please indicate the first and last name of each companion in your RSVP so we can prepare accordingly.',
    companionsOnly: true,
  },
  {
    question: 'What if I need to change my RSVP?',
    answer:
      'You can update your RSVP using the same link that was sent to you, as long as the RSVP window is still open.',
  },
];

interface FAQProps {
  maxCompanions?: number;
}

const FAQ: React.FC<FAQProps> = ({ maxCompanions = 0 }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleFaqs = faqs.filter((f) => !(f.companionsOnly && maxCompanions === 0));

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section faq">
      <h2 className="section-title">Frequently Asked Questions</h2>
      <div className="section-divider-small"></div>

      <div className="faq-list">
        {visibleFaqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
          >
            <button className="faq-question" onClick={() => toggle(index)}>
              <span>{faq.question}</span>
              <span className="faq-toggle">{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
