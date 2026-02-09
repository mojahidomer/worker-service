"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CategoryDropdown } from "../../CategoryDropdown";
import { useServiceTypes } from "@/lib/hooks/useServiceTypes";

const heroImage = "https://www.figma.com/api/mcp/asset/808c674e-b444-4f8e-979e-fabf383979f8";
export function HeroSection() {
  const [services, setServices] = useState<string[]>([]);
  const { services: apiServices } = useServiceTypes({ includeAll: true });
  const serviceOptions = useMemo(
    () => apiServices.map((item) => item.name),
    [apiServices]
  );

  const handleServiceChange = (next: string[]) => {
    if (next.includes("All Services")) {
      setServices(["All Services"]);
      return;
    }
    setServices(next);
  };

  return (
    <section className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]" aria-labelledby="hero-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-[64px]">
        <div className="flex flex-col gap-6 flex-1">
          <h1
            id="hero-heading"
            className="text-[40px] sm:text-[48px] lg:text-[56px] font-bold text-black leading-[61.6px] tracking-[-1.12px]"
          >
            Expert home services,
            <br />
            right in your
            <br />
            neighborhood.
          </h1>
          <p className="text-[18px] leading-[27px] text-neutral-muted max-w-[480px]">
            From leaky faucets to full home cleaning, find trusted professionals instantly with
            upfront pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 items-start">
            <div className="flex-1 max-w-[400px] w-full">
              <CategoryDropdown
                options={serviceOptions}
                values={services}
                onChange={handleServiceChange}
                placeholder="Search services..."
              />
            </div>
            <Link
              href={
                services.length && !services.includes("All Services")
                  ? `/find?skill=${encodeURIComponent(services[0])}`
                  : "/find"
              }
              className="inline-flex items-center justify-center px-[24px] py-[12px] text-[16px] font-medium leading-[24px] text-white bg-brand-green rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              Find Services
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full max-w-[640px] rounded-[12px] bg-neutral-border overflow-hidden">
          <div className="h-[320px] sm:h-[420px] lg:h-[480px] w-full relative">
            <img
              src={heroImage}
              alt="Service professional cleaning a living room"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
