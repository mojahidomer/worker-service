import { SectionHeader } from "../shared/SectionHeader";

const FAQS = [
  {
    question: "Are all pros background checked?",
    answer: "Yes. Every pro completes identity verification, background checks, and license reviews when required.",
  },
  {
    question: "How does pricing work?",
    answer: "You receive upfront estimates before booking, and can compare multiple pros side by side.",
  },
  {
    question: "What if I need to reschedule?",
    answer: "Reschedule or cancel directly in your dashboard. Most services allow changes up to 24 hours before.",
  },
  {
    question: "Do you offer support if something goes wrong?",
    answer: "Our support team is available 7 days a week and we help resolve any issues quickly.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]" aria-labelledby="faq-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="Frequently asked questions"
          subtitle="Everything you need to know before booking a pro."
          eyebrow="FAQ"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((item) => (
            <div key={item.question} className="border border-neutral-border rounded-[16px] p-6 bg-white">
              <h3 className="text-[16px] font-semibold leading-[24px] text-black mb-3">{item.question}</h3>
              <p className="text-[14px] leading-[21px] text-neutral-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
