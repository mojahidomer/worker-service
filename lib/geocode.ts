import { loadGoogleMaps } from "@/lib/load-google-maps";
import type { AddressFormState } from "@/types/address";

function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  const c = components.find((c) => c.types.includes(type));
  return c?.long_name ?? "";
}

/**
 * Reverse-geocode lat/lng to address (e.g. after "Use my current location").
 * Uses Google Geocoder. Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<AddressFormState | null> {
  await loadGoogleMaps();
  const google = (window as Window & { google?: typeof globalThis.google }).google;
  if (!google?.maps) return null;

  const geocoder = new google.maps.Geocoder();
  const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK" && results?.length) resolve(results);
        else resolve(null);
      }
    );
  });

  if (!result?.[0]) return null;
  const r = result[0];
  const ac = r.address_components ?? [];

  const streetNumber = getComponent(ac, "street_number");
  const route = getComponent(ac, "route");
  const line1 = [streetNumber, route].filter(Boolean).join(" ") || r.formatted_address ?? "—";

  const area =
    getComponent(ac, "sublocality_level_1") ||
    getComponent(ac, "sublocality") ||
    getComponent(ac, "neighborhood") ||
    getComponent(ac, "locality") ||
    "—";

  const city =
    getComponent(ac, "locality") ||
    getComponent(ac, "postal_town") ||
    getComponent(ac, "administrative_area_level_2") ||
    "—";

  const state = getComponent(ac, "administrative_area_level_1") || "—";
  const country = getComponent(ac, "country") || "—";
  const pincode = getComponent(ac, "postal_code") || "—";

  const loc = r.geometry?.location;
  const lat = loc && typeof loc.lat === "function" ? loc.lat() : (loc as { lat: number })?.lat ?? latitude;
  const lng = loc && typeof loc.lng === "function" ? loc.lng() : (loc as { lng: number })?.lng ?? longitude;

  return {
    line1: line1.trim() || "—",
    area: area.trim() || "—",
    city: city.trim() || "—",
    state: state.trim() || "—",
    country: country.trim() || "—",
    pincode: pincode.trim() || "—",
    latitude: lat,
    longitude: lng,
    formattedAddress: r.formatted_address ?? undefined,
  };
}
