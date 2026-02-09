"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import type { AddressFormState } from "@/types/address";

export interface AddressAutocompleteProps {
  /** Current input value (controlled) */
  value?: string;
  /** Called when user types (for controlled input) */
  onChange?: (value: string) => void;
  /** Called when user selects a place; receives extracted address fields */
  onSelect?: (address: AddressFormState) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  /** Input aria attributes */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  const c = components.find((c) => c.types.includes(type));
  return c?.long_name ?? "";
}

/**
 * Parse Place result into AddressFormState (area, city, pincode, lat/lng, etc.).
 */
function placeToAddress(place: google.maps.places.PlaceResult): AddressFormState | null {
  const ac = place.address_components ?? [];
  const streetNumber = getComponent(ac, "street_number");
  const route = getComponent(ac, "route");
  const line1 = [streetNumber, route].filter(Boolean).join(" ") || place.formatted_address ?? "";

  const area =
    getComponent(ac, "sublocality_level_1") ||
    getComponent(ac, "sublocality") ||
    getComponent(ac, "neighborhood") ||
    getComponent(ac, "locality") ||
    "";

  const city =
    getComponent(ac, "locality") ||
    getComponent(ac, "postal_town") ||
    getComponent(ac, "administrative_area_level_2") ||
    "";

  const state = getComponent(ac, "administrative_area_level_1");
  const country = getComponent(ac, "country");
  const pincode = getComponent(ac, "postal_code");

  const location = place.geometry?.location;
  if (!location) return null;

  const latitude = typeof location.lat === "function" ? location.lat() : location.lat;
  const longitude = typeof location.lng === "function" ? location.lng() : location.lng;

  return {
    line1: line1.trim() || "—",
    area: area.trim() || "—",
    city: city.trim() || "—",
    state: state.trim() || "—",
    country: country.trim() || "—",
    pincode: pincode.trim() || "—",
    latitude,
    longitude,
    formattedAddress: place.formatted_address ?? undefined,
  };
}

export function AddressAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
  id,
  name,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;

        const Autocomplete = window.google.maps.places.Autocomplete;
        const autocomplete = new Autocomplete(inputRef.current, {
          types: ["address"],
          fields: ["address_components", "geometry", "formatted_address"],
        });
        autocompleteRef.current = autocomplete;

        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) {
            return;
          }
          const address = placeToAddress(place);
          if (address && onSelect) {
            onSelect(address);
          }
          if (place.formatted_address && onChange) {
            onChange(place.formatted_address);
          }
        });

        return () => {
          if (listener && window.google?.maps?.event) {
            window.google.maps.event.clearInstanceListeners(autocomplete);
          }
          autocompleteRef.current = null;
        };
      })
      .catch((err) => {
        if (!cancelled) setScriptError(err instanceof Error ? err.message : "Failed to load maps");
      });

    return () => {
      cancelled = true;
    };
  }, [onSelect, onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        autoComplete="off"
      />
      {scriptError && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {scriptError}
        </p>
      )}
    </div>
  );
}
