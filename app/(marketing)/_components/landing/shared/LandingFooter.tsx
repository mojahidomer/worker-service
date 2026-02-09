import Link from "next/link";

const footerLogo = "https://www.figma.com/api/mcp/asset/40332cd4-3fc8-45ad-9c0c-b9f608a0f5f5";

const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    heading: "Customers",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Safety", href: "/#safety" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "Professionals",
    links: [
      { label: "Join as a Pro", href: "/worker/register" },
      { label: "Service areas", href: "/#areas" },
      { label: "Download app", href: "/#download" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="w-full bg-white border-t border-neutral-border">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-[48px] pt-[65px] pb-[64px]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          <div className="flex flex-col gap-4 w-full lg:w-[480px]">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-5 h-5 flex items-center justify-center" aria-hidden>
                <img src={footerLogo} alt="" className="w-5 h-5" />
              </div>
              <span className="font-bold text-[20px] leading-[30px] text-black">LocalPros</span>
            </Link>
            <p className="text-[14px] leading-[21px] text-neutral-muted max-w-[240px]">
              The trusted marketplace for all your home service needs.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 lg:gap-12">
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="w-[240px]">
                <h3 className="text-[14px] font-semibold leading-[21px] text-black mb-4">{col.heading}</h3>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[14px] leading-[21px] text-neutral-muted hover:text-black transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
