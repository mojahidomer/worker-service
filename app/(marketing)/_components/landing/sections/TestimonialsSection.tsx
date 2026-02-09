import { SectionHeader } from "../shared/SectionHeader";

const TESTIMONIALS = [
  {
    quote:
      "Booked a same-day plumber in under 10 minutes. The pricing was exactly what we paid.",
    name: "Erica S.",
    location: "Austin, TX",
  },
  {
    quote:
      "Loved seeing verified licenses and reviews. Our electrician was punctual and professional.",
    name: "James T.",
    location: "Denver, CO",
  },
  {
    quote:
      "The cleanup crew was amazing. Easy booking, friendly service, and spotless results.",
    name: "Priya M.",
    location: "Seattle, WA",
  },
];

export function TestimonialsSection() {
  return (
    <section id="reviews" className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px] bg-[#FBFAF9]" aria-labelledby="reviews-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="What homeowners are saying"
          subtitle="Real feedback from customers who booked pros on LocalPros."
          eyebrow="Reviews"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="border border-neutral-border rounded-[16px] p-6 bg-white flex flex-col gap-4">
              <blockquote className="text-[15px] leading-[23px] text-black">“{item.quote}”</blockquote>
              <figcaption className="text-[13px] leading-[19px] text-neutral-muted">
                <span className="font-semibold text-black">{item.name}</span> · {item.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
