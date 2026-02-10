import Link from "next/link";
import { SectionHeader } from "../shared/SectionHeader";

const WORKERS = [
  {
    name: "Aarav Singh",
    title: "Master Plumber",
    phone: "+91 98765 43210",
    rating: "4.9",
    reviews: "186 reviews",
    price: "₹450/hr",
    skills: ["Plumbing", "Pipe Repair", "Bathroom Install", "Leak Fix"],
  },
  {
    name: "Neha Patel",
    title: "Certified Electrician",
    phone: "+91 91234 56780",
    rating: "4.8",
    reviews: "142 reviews",
    price: "₹520/hr",
    skills: ["Electrical", "Wiring", "Lighting", "Appliance Setup"],
  },
  {
    name: "Rohan Das",
    title: "Home Cleaning Pro",
    phone: "+91 99887 66554",
    rating: "4.7",
    reviews: "210 reviews",
    price: "₹350/hr",
    skills: ["Deep Clean", "Move-out", "Eco Supplies", "Sanitization"],
  },
];

export function WorkerCardsSection() {
  return (
    <section className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px] bg-[#F8FBF9]" aria-labelledby="worker-cards">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="Pros ready for your next project"
          subtitle="Browse verified professionals with transparent rates and trusted reviews."
          eyebrow="Top pros"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WORKERS.map((worker) => (
            <article
              key={worker.name}
              className="group overflow-hidden rounded-[16px] border border-neutral-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-[140px] w-full">
                <div className="h-full w-full bg-[#eef2f0]" />
                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-white" />
                  <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-black">
                    Verified
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-black">{worker.name}</h3>
                    <p className="text-[11px] text-neutral-muted">{worker.title}</p>
                  </div>
                  <button className="rounded-full border border-neutral-border px-2 py-1 text-[10px] text-neutral-muted hover:border-brand-green hover:text-brand-green">
                    Save
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-muted">
                  <span>⭐ {worker.rating}</span>
                  <span>{worker.reviews}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {worker.skills.slice(0, 3).map((skill) => (
                    <span
                      key={`${worker.name}-${skill}`}
                      className="rounded-full border border-[#d7f2e3] bg-[#dbf7e5] px-2 py-1 text-[10px] font-medium text-black"
                    >
                      {skill}
                    </span>
                  ))}
                  {worker.skills.length > 3 ? (
                    <span className="rounded-full border border-neutral-border bg-white px-2 py-1 text-[10px] text-neutral-muted">
                      +{worker.skills.length - 3} more
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-black">{worker.price}</span>
                    <span className="text-[11px] text-neutral-muted">📞 {worker.phone}</span>
                  </div>
                  <Link
                    href="/worker/demo"
                    className="rounded-[10px] bg-brand-green px-3 py-2 text-[11px] font-semibold text-white transition-all group-hover:translate-x-0.5"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
