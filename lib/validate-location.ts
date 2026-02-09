/**
 * Backend validation for location data.
 * Golden rule: humans enter addresses, systems generate coordinates.
 * Reject requests with missing or invalid lat/lng.
 */
export function validateLatLng(latitude: unknown, longitude: unknown): { ok: true } | { ok: false; error: string } {
  const lat = typeof latitude === "number" ? latitude : Number(latitude);
  const lng = typeof longitude === "number" ? longitude : Number(longitude);

  if (latitude == null || longitude == null || latitude === "" || longitude === "") {
    return { ok: false, error: "Invalid location data: latitude and longitude are required." };
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { ok: false, error: "Invalid location data: coordinates must be numbers." };
  }
  if (lat < -90 || lat > 90) {
    return { ok: false, error: "Invalid location data: latitude must be between -90 and 90." };
  }
  if (lng < -180 || lng > 180) {
    return { ok: false, error: "Invalid location data: longitude must be between -180 and 180." };
  }
  return { ok: true };
}
