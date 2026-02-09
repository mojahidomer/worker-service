import { SectionHeader } from "../shared/SectionHeader";

const PROS = [
  {
    name: "Maya D.",
    role: "Master Plumber",
    rating: "5.0",
    jobs: "320+ jobs",
    bio: "Specializes in fast leak repairs and bathroom upgrades.",
  },
  {
    name: "Chris L.",
    role: "Licensed Electrician",
    rating: "4.9",
    jobs: "275+ jobs",
    bio: "Known for clean installs and smart home setups.",
  },
  {
    name: "Sofia K.",
    role: "Home Cleaning Pro",
    rating: "4.8",
    jobs: "410+ jobs",
    bio: "Deep cleans, move-outs, and eco-friendly supplies.",
  },
];

export function FeaturedProsSection() {
  return (
    <section id="pros" className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px] bg-white" aria-labelledby="pros-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="Featured pros near you"
          subtitle="Top-rated specialists with verified credentials and real customer reviews."
          eyebrow="Top picks"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROS.map((pro) => (
            <div key={pro.name} className="border border-neutral-border rounded-[16px] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-mint text-black font-semibold flex items-center justify-center">
                  {pro.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold leading-[27px] text-black">{pro.name}</h3>
                  <p className="text-[14px] leading-[21px] text-neutral-muted">{pro.role}</p>
                </div>
              </div>
              <p className="text-[14px] leading-[21px] text-neutral-muted">{pro.bio}</p>
              <div className="flex items-center gap-4 text-[13px] leading-[19px] text-neutral-muted">
                <span className="px-2 py-1 rounded-full bg-[#F8F8F7]">{pro.rating} rating</span>
                <span className="px-2 py-1 rounded-full bg-[#F8F8F7]">{pro.jobs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
