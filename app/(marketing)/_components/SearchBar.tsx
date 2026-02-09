"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CategoryDropdown } from "./CategoryDropdown";
import { loadGoogleMaps } from "@/lib/load-google-maps";

type SearchBarProps = {
  serviceOptions: string[];
  selectedServices: string[];
  onServicesChange: (values: string[]) => void;
  locationValue: string;
  onLocationChange: (value: string) => void;
  onPlaceSelected?: (formatted: string, lat?: number, lng?: number) => void;
  onUseMyLocation?: () => void;
  onSearch?: () => void;
  searchHref?: string;
  size?: "hero" | "find";
  actionLabel?: string;
  fullWidth?: boolean;
  forceIcon?: boolean;
  placeholderService?: string;
  placeholderLocation?: string;
};

export function SearchBar({
  serviceOptions,
  selectedServices,
  onServicesChange,
  locationValue,
  onLocationChange,
  onPlaceSelected,
  onUseMyLocation,
  onSearch,
  searchHref,
  size = "find",
  actionLabel,
  fullWidth = false,
  forceIcon = false,
  placeholderService = "Search services...",
  placeholderLocation = "Enter a location",
}: SearchBarProps) {
  const locationInputRef = useRef<HTMLInputElement | null>(null);

  const { containerClassName, dropdownButtonClassName, locationClassName, iconButtonClassName } = useMemo(() => {
    if (size === "hero") {
      return {
        containerClassName:
          `w-full ${fullWidth ? "max-w-none" : "max-w-[820px]"} rounded-[28px] border border-neutral-border bg-white px-4 py-3 shadow-sm`,
        dropdownButtonClassName: "h-[48px] rounded-full border-none bg-[#f8f8f7] px-5 text-[14px]",
        locationClassName: "flex flex-1 items-center gap-2 rounded-full bg-[#f8f8f7] px-5 py-3 text-[14px] text-black",
        iconButtonClassName:
          "inline-flex h-[46px] items-center justify-center rounded-full bg-brand-green text-white px-4 cursor-pointer",
      };
    }
    return {
      containerClassName:
        "flex flex-col gap-3 rounded-[16px] border border-neutral-border bg-white p-3 lg:flex-row lg:items-center lg:gap-4",
      dropdownButtonClassName: "h-[44px] px-4 py-2 text-[13px]",
      locationClassName: "flex flex-1 items-center gap-3 rounded-[12px] border border-neutral-border bg-white px-4 py-2",
        iconButtonClassName:
          "rounded-[12px] bg-brand-green px-5 py-3 text-[12px] font-semibold text-white lg:h-[44px] cursor-pointer",
    };
  }, [size]);

  useEffect(() => {
    if (!onPlaceSelected) return;
    let autocomplete: google.maps.places.Autocomplete | null = null;

    loadGoogleMaps()
      .then(() => {
        if (!locationInputRef.current) return;
        autocomplete = new google.maps.places.Autocomplete(locationInputRef.current, {
          types: ["geocode"],
          fields: ["formatted_address", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          const loc = place?.geometry?.location;
          const latValue = loc ? (typeof loc.lat === "function" ? loc.lat() : loc.lat) : undefined;
          const lngValue = loc ? (typeof loc.lng === "function" ? loc.lng() : loc.lng) : undefined;
          const formatted = place?.formatted_address ?? locationInputRef.current?.value ?? "";
          onPlaceSelected(formatted, typeof latValue === "number" ? latValue : undefined, typeof lngValue === "number" ? lngValue : undefined);
        });
      })
      .catch(() => {});

    return () => {
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [onPlaceSelected]);

  return (
    <div className={containerClassName}>
      <div className={size === "hero" ? "flex flex-col gap-4 md:flex-row md:items-center" : "flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 w-full"}>
        <div className={size === "hero" ? "flex-1" : "w-full lg:w-[220px]"}>
          <CategoryDropdown
            options={serviceOptions}
            values={selectedServices}
            onChange={onServicesChange}
            placeholder={placeholderService}
            buttonClassName={dropdownButtonClassName}
            listClassName="rounded-[16px]"
          />
        </div>

        <div className={locationClassName}>
          <span className="text-neutral-muted">📍</span>
          <input
            ref={locationInputRef}
            value={locationValue}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder={placeholderLocation}
            className={size === "hero"
              ? "w-full bg-transparent text-[14px] text-black placeholder:text-neutral-muted focus:outline-none"
              : "flex-1 text-[13px] text-black placeholder:text-neutral-muted focus:outline-none"}
          />
          {onUseMyLocation ? (
            <button
              type="button"
              onClick={onUseMyLocation}
              className={`${size === "hero" ? "text-[12px] font-semibold text-brand-green" : "text-[12px] font-medium text-brand-green"} whitespace-nowrap cursor-pointer`}
            >
              Use my location
            </button>
          ) : null}
        </div>

        {searchHref ? (
          <Link href={searchHref} className={iconButtonClassName} aria-label="Find services">
            {actionLabel && !forceIcon ? (
              <span className={size === "hero" ? "px-2 text-[12px] font-semibold" : ""}>{actionLabel}</span>
            ) : size === "hero" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              "Update results"
            )}
          </Link>
        ) : (
          <button type="button" onClick={onSearch} className={iconButtonClassName}>
            {actionLabel && !forceIcon ? (
              <span className={size === "hero" ? "px-2 text-[12px] font-semibold" : ""}>{actionLabel}</span>
            ) : size === "hero" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              "Update results"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
