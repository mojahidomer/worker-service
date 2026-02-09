import { SectionHeader } from "../shared/SectionHeader";

const AREAS = [
  "New York City, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Miami, FL",
  "Seattle, WA",
  "Atlanta, GA",
];

export function ServiceAreasSection() {
  return (
    <section id="areas" className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]" aria-labelledby="areas-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        <SectionHeader
          title="Available in major cities"
          subtitle="LocalPros is growing fast — find coverage in these metro areas and more."
          eyebrow="Service areas"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AREAS.map((area) => (
            <div
              key={area}
              className="border border-neutral-border rounded-[12px] px-4 py-3 text-[14px] leading-[21px] text-neutral-muted bg-white"
            >
              {area}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
