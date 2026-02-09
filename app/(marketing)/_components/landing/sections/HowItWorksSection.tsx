import { SectionHeader } from "../shared/SectionHeader";

const STEPS = [
  {
    title: "Tell us what you need",
    description: "Share the project details, preferred time, and budget range in minutes.",
  },
  {
    title: "Compare top pros",
    description: "Review profiles, ratings, and transparent quotes from vetted local experts.",
  },
  {
    title: "Book with confidence",
    description: "Chat, schedule, and pay securely. We stay with you until the job is done.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="How it works"
          subtitle="From request to completion, we keep everything simple and transparent."
          eyebrow="3 steps"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="border border-neutral-border rounded-[16px] p-6 flex flex-col gap-4 bg-white"
            >
              <div className="w-10 h-10 rounded-full bg-brand-mint text-black flex items-center justify-center text-[16px] font-semibold">
                0{index + 1}
              </div>
              <div>
                <h3 className="text-[18px] font-semibold leading-[27px] text-black mb-2">{step.title}</h3>
                <p className="text-[14px] leading-[21px] text-neutral-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
