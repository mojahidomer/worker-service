import Link from "next/link";

const workerImage = "https://www.figma.com/api/mcp/asset/70e1948c-101f-4f79-9ecc-a103f57bfd08";

export function CtaSection() {
  return (
    <section className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]" aria-labelledby="cta-heading">
      <div className="max-w-[1440px] mx-auto">
        <div className="rounded-[24px] bg-brand-green overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 p-8 sm:p-12 lg:p-[64px] flex flex-col justify-center gap-6">
            <h2 id="cta-heading" className="text-[32px] sm:text-[36px] lg:text-[40px] font-bold text-white leading-[44px]">
              Are you a skilled
              <br />
              professional?
            </h2>
            <p className="text-[16px] leading-[24px] text-white/90 max-w-[400px]">
              Join thousands of workers growing their business with LocalPros. Flexible schedule,
              reliable payments.
            </p>
            <Link
              href="/worker/register"
              className="inline-flex items-center justify-center px-[28px] py-[14px] text-[16px] font-semibold leading-[24px] text-black bg-white rounded-lg hover:bg-white/90 transition-colors w-fit"
            >
              Register as Worker
            </Link>
          </div>
          <div className="flex-1 bg-neutral-border min-h-[240px] sm:min-h-[320px] lg:min-h-[360px] relative">
            <img
              src={workerImage}
              alt="Skilled worker in a workshop"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
