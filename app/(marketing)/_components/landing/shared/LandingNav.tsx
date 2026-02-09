import Link from "next/link";

const logoMark = "https://www.figma.com/api/mcp/asset/ca989246-0844-4a8f-ae6b-f115a2df4541";

export function LandingNav() {
  return (
    <nav className="w-full bg-white border-b border-neutral-border">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-[48px] pt-[20px] pb-[21px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center" aria-hidden>
            <img src={logoMark} alt="" className="w-6 h-6" />
          </div>
          <span className="font-bold text-[20px] leading-[30px] text-black">LocalPros</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#services" className="text-[14px] font-medium leading-[21px] text-neutral-muted hover:text-black transition-colors">
            Explore
          </Link>
          <Link href="/#how-it-works" className="text-[14px] font-medium leading-[21px] text-neutral-muted hover:text-black transition-colors">
            How it Works
          </Link>
          <Link href="/#reviews" className="text-[14px] font-medium leading-[21px] text-neutral-muted hover:text-black transition-colors">
            Reviews
          </Link>
          <Link href="/#faq" className="text-[14px] font-medium leading-[21px] text-neutral-muted hover:text-black transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[14px] font-medium leading-[21px] text-neutral-muted hover:text-black transition-colors">
            Log in
          </Link>
          <Link
            href="/worker/register"
            className="inline-flex items-center justify-center px-4 py-2 text-[14px] font-medium leading-[21px] text-white bg-brand-green rounded-lg hover:opacity-90 transition-opacity"
          >
            Register as Worker
          </Link>
        </div>
      </div>
    </nav>
  );
}
