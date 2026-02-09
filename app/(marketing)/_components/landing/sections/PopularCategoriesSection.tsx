import Link from "next/link";

const plumbingIcon = "https://www.figma.com/api/mcp/asset/596aea5c-dbc6-4817-a010-5b7f3dde7f51";
const electricianIcon = "https://www.figma.com/api/mcp/asset/8c75d858-f444-46f3-873b-1a441ffb64a7";
const cleaningIcon = "https://www.figma.com/api/mcp/asset/daad4bb4-31ee-49ba-a0f5-176d94ee4fe8";
const applianceIcon = "https://www.figma.com/api/mcp/asset/22ed6cbf-ba82-45e0-8511-235a82d30423";

const SERVICES = [
  {
    title: "Plumbing",
    description: "Leaks, installs, and more",
    icon: plumbingIcon,
    slug: "plumbing",
  },
  {
    title: "Electrician",
    description: "Wiring, lighting, repairs",
    icon: electricianIcon,
    slug: "electrical",
  },
  {
    title: "Home Cleaning",
    description: "Regular or deep clean",
    icon: cleaningIcon,
    slug: "cleaning",
  },
  {
    title: "Appliance Repair",
    description: "Fixing washers, dryers, etc.",
    icon: applianceIcon,
    slug: "appliance-repair",
  },
];

export function PopularCategoriesSection() {
  return (
    <section
      id="services"
      className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px] bg-white"
      aria-labelledby="popular-services-heading"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="popular-services-heading" className="text-[32px] font-bold leading-[48px] text-black">
            Popular Services
          </h2>
          <p className="text-[16px] leading-[24px] text-neutral-muted">
            Top categories booked by homeowners near you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/#services?category=${s.slug}`}
              className="flex flex-col items-center gap-4 px-[25px] py-[33px] bg-[#FBFAF9] border border-neutral-border rounded-[12px] transition-colors"
            >
              <div className="w-16 h-16 rounded-[32px] bg-brand-mint flex items-center justify-center shrink-0">
                <img src={s.icon} alt="" className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-semibold leading-[27px] text-black mb-1">{s.title}</h3>
                <p className="text-[14px] leading-[21px] text-neutral-muted">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
