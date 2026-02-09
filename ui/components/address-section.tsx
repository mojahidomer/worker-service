"use client";

import { useState } from "react";
import { AddressAutocomplete } from "./address-autocomplete";
import { reverseGeocode } from "@/lib/geocode";
import type { AddressFormState } from "@/types/address";

export interface AddressSectionProps {
  /** Search input value (controlled) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Full address state (area, city, pincode, lat/lng) – set when user selects from autocomplete or current location */
  address?: AddressFormState | null;
  onAddressSelect: (address: AddressFormState) => void;
  /** Optional: show service radius dropdown (for worker registration) */
  showServiceRadius?: boolean;
  serviceRadiusKm?: number;
  onServiceRadiusChange?: (km: number) => void;
  disabled?: boolean;
  /** Class names */
  className?: string;
  inputClassName?: string;
  /** Accessibility */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

const SERVICE_RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100, 200, 500];

export function AddressSection({
  searchValue = "",
  onSearchChange,
  address,
  onAddressSelect,
  showServiceRadius = false,
  serviceRadiusKm = 5,
  onServiceRadiusChange,
  disabled,
  className,
  inputClassName,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: AddressSectionProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  async function handleUseCurrentLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          if (result) {
            onAddressSelect(result);
            onSearchChange?.(result.formattedAddress ?? `${result.area}, ${result.city}`);
          } else {
            setGeoError("Could not resolve address for this location.");
          }
        } catch {
          setGeoError("Failed to get address from location.");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("Could not get your location. Check permissions or try search.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search your address
      </label>
      <div className="flex flex-col gap-2">
        <AddressAutocomplete
          value={searchValue}
          onChange={onSearchChange}
          onSelect={onAddressSelect}
          placeholder="Search your address"
          disabled={disabled}
          className={inputClassName}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={disabled || geoLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
        >
          {geoLoading ? (
            "Getting location…"
          ) : (
            <>
              <span aria-hidden>📍</span> Use my current location
            </>
          )}
        </button>
      </div>

      {(geoError) && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {geoError}
        </p>
      )}

      {address && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
          <p className="font-medium text-gray-700 mb-1">Address details</p>
          <ul className="text-gray-600 space-y-0.5">
            <li>Area: {address.area}</li>
            <li>City: {address.city}</li>
            <li>State: {address.state}</li>
            <li>Pincode: {address.pincode}</li>
          </ul>
        </div>
      )}

      {showServiceRadius && onServiceRadiusChange && (
        <div className="mt-3">
          <label htmlFor="service-radius" className="block text-sm font-medium text-gray-700 mb-1">
            Service radius
          </label>
          <select
            id="service-radius"
            value={serviceRadiusKm}
            onChange={(e) => onServiceRadiusChange(Number(e.target.value))}
            disabled={disabled}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {SERVICE_RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
