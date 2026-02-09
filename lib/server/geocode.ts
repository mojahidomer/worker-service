type GeocodeResult = {
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Geocoding is not configured. Set GOOGLE_MAPS_API_KEY.");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to reach geocoding service.");
  }

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error("Unable to geocode the provided address.");
  }

  const location = data.results[0]?.geometry?.location;
  if (!location) {
    throw new Error("No location returned from geocoding.");
  }

  return { latitude: location.lat, longitude: location.lng };
}
