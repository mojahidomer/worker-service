import Link from "next/link";
import { SectionHeader } from "../shared/SectionHeader";

export function AppDownloadSection() {
  return (
    <section id="download" className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px] bg-[#FBFAF9]" aria-labelledby="download-heading">
      <div className="max-w-[1440px] mx-auto">
        <div className="rounded-[24px] border border-neutral-border bg-white p-8 sm:p-12 lg:p-[64px] flex flex-col lg:flex-row gap-10 lg:items-center">
          <div className="flex-1 flex flex-col gap-6">
            <SectionHeader
              title="Book pros on the go"
              subtitle="Get real-time updates, chat with pros, and manage appointments from anywhere."
              eyebrow="Mobile app"
              align="left"
            />
            <div className="flex flex-wrap gap-4">
              <Link
                href="/app/ios"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-black text-white text-[14px] font-semibold leading-[21px]"
              >
                Download for iOS
              </Link>
              <Link
                href="/app/android"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-neutral-border text-[14px] font-semibold leading-[21px]"
              >
                Get it on Android
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-[260px] sm:h-[320px] bg-brand-mint rounded-[20px] flex flex-col justify-center p-8 gap-4">
              <div className="text-[14px] font-semibold uppercase tracking-[1px] text-neutral-muted">Today</div>
              <div className="text-[20px] font-semibold text-black">Cleaning booked for 2:00 PM</div>
              <div className="text-[14px] text-neutral-muted">Push updates keep you in the loop.</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green" />
                <span className="text-[13px] text-black">Live tracking enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
