const FEATURES = [
  {
    title: "Verified Professionals",
    description:
      "Every worker is background checked and verified for your peace of mind and safety.",
    icon: "https://www.figma.com/api/mcp/asset/9a87b969-11db-4890-abfb-3963916fc2cb",
  },
  {
    title: "Upfront Pricing",
    description:
      "See the exact cost before you book. No hidden fees or last-minute surprises.",
    icon: "https://www.figma.com/api/mcp/asset/a3e20b4d-106f-45d3-afca-cd3d7027be24",
  },
  {
    title: "Satisfaction Guaranteed",
    description:
      "If you're not happy with the service, we'll work with you to make it right.",
    icon: "https://www.figma.com/api/mcp/asset/4b6948fa-3d2d-4296-9d1f-e0cc66dc262e",
  },
];

export function TrustSection() {
  return (
    <section
      id="safety"
      className="px-6 sm:px-12 lg:px-[120px] py-16 lg:py-[80px] bg-brand-mint"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <img src={f.icon} alt="" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[20px] font-semibold leading-[30px] text-black mb-2">{f.title}</h3>
                <p className="text-[15px] leading-[22.5px] text-neutral-muted max-w-[368px]">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
