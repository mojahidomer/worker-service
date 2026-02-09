import { SectionHeader } from "../shared/SectionHeader";

const STATS = [
  { value: "12k+", label: "Verified pros across the U.S." },
  { value: "4.9/5", label: "Average customer rating" },
  { value: "45 min", label: "Median response time" },
  { value: "100%", label: "Upfront pricing shown" },
];

export function StatsSection() {
  return (
    <section className="px-6 sm:px-12 lg:px-[48px] py-12 lg:py-[64px] bg-[#FBFAF9]" aria-labelledby="stats-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
        <SectionHeader
          title="Trusted by homeowners who want it done right"
          subtitle="LocalPros pairs you with vetted pros, clear estimates, and a smooth booking experience."
          eyebrow="Marketplace trust"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-neutral-border rounded-[16px] px-6 py-5 flex flex-col gap-2"
            >
              <div className="text-[28px] font-bold leading-[36px] text-black">{stat.value}</div>
              <p className="text-[14px] leading-[21px] text-neutral-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
