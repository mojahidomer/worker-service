"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useServiceTypes } from "@/lib/hooks/useServiceTypes";
import { SearchBar } from "../../SearchBar";

const heroImage = "https://www.figma.com/api/mcp/asset/808c674e-b444-4f8e-979e-fabf383979f8";
const heroImageAlt = "Bright living room interior";
const heroImageTwo =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop";
const heroImageThree =
  "https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=1400&auto=format&fit=crop";
export function HeroSection() {
  const [services, setServices] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { services: apiServices } = useServiceTypes({ includeAll: true });
  const serviceOptions = useMemo(
    () => apiServices.map((item) => item.name),
    [apiServices]
  );
  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    const filtered = services.filter((item) => item !== "All Services");
    if (filtered.length) {
      params.set("skill", filtered.join(","));
    }
    if (location.trim()) params.set("location", location.trim());
    if (typeof lat === "number" && typeof lng === "number") {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    const qs = params.toString();
    return qs ? `/find?${qs}` : "/find";
  }, [lat, lng, location, services]);

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;
        setLat(nextLat);
        setLng(nextLng);

        try {
          // Let the Find page resolve text location if needed
          setLocation("Current location");
        } catch {
          setLocation("Current location");
        }
      },
      async () => {
        try {
          const res = await fetch("/api/geoip");
          if (!res.ok) throw new Error("Geo IP location unavailable.");
          const data = await res.json();
          const label = [data.city, data.region, data.country].filter(Boolean).join(", ") || "Current location";
          setLat(data.latitude);
          setLng(data.longitude);
          setLocation(label);
        } catch {
          setLocationError("Unable to access your location. Please enable location permissions.");
        }
      }
    );
  };

  const handleServiceChange = (next: string[]) => {
    if (next.includes("All Services")) {
      setServices(["All Services"]);
      return;
    }
    setServices(next);
  };

  return (
    <section className="px-6 sm:px-12 lg:px-[48px] py-16 lg:py-[80px]" aria-labelledby="hero-heading">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-10">
        <span className="rounded-full bg-[#e9f7ef] px-4 py-2 text-[12px] font-semibold text-brand-green">
          #1 Marketplace for Home Services
        </span>
        <div className="max-w-[720px] text-center">
          <h1
            id="hero-heading"
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-bold text-black leading-[1.1] tracking-[-1px]"
          >
            Find the perfect pro for
            <br />
            your home project
          </h1>
          <p className="mt-4 text-[15px] sm:text-[16px] leading-[24px] text-neutral-muted">
            Connect with verified local experts for plumbing, electrical, cleaning, and more.
            Transparent pricing, guaranteed satisfaction.
          </p>
        </div>

        <SearchBar
          size="hero"
          serviceOptions={serviceOptions}
          selectedServices={services}
          onServicesChange={handleServiceChange}
          locationValue={location}
          onLocationChange={(value) => {
            setLocation(value);
            setLat(null);
            setLng(null);
          }}
          onPlaceSelected={(formatted, nextLat, nextLng) => {
            setLocation(formatted);
            setLat(typeof nextLat === "number" ? nextLat : null);
            setLng(typeof nextLng === "number" ? nextLng : null);
          }}
          onUseMyLocation={() => void useMyLocation()}
          searchHref={searchHref}
          placeholderService="What service do you need today?"
          placeholderLocation="Enter your location"
        />

        <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-neutral-muted">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#dbf7e5] text-brand-green">
              ✓
            </span>
            Verified Pros
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#dbf7e5] text-brand-green">
              ✓
            </span>
            Insured Work
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#dbf7e5] text-brand-green">
              ★
            </span>
            4.9/5 Average Rating
          </span>
        </div>

        {locationError ? (
          <p className="text-[12px] text-red-500">{locationError}</p>
        ) : null}

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="overflow-hidden rounded-[18px] bg-[#f3f3f3]">
            <img src={heroImage} alt={heroImageAlt} className="h-[220px] w-full object-cover sm:h-[260px]" />
          </div>
          <div className="overflow-hidden rounded-[18px] bg-[#f3f3f3]">
            <img src={heroImageTwo} alt="Plumber at kitchen sink" className="h-[220px] w-full object-cover sm:h-[260px]" />
          </div>
          <div className="overflow-hidden rounded-[18px] bg-[#f3f3f3]">
            <img src={heroImageThree} alt="Electrician working on panel" className="h-[220px] w-full object-cover sm:h-[260px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
