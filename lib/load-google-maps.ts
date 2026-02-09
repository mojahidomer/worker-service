const SCRIPT_ID = "google-maps-places-script";
const URL = "https://maps.googleapis.com/maps/api/js";

let loadPromise: Promise<void> | null = null;

/**
 * Load Google Maps JavaScript API with Places library.
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in env.
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if ((window as Window & { __googleMapsLoaded?: boolean }).__googleMapsLoaded) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set")
    );
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      (window as Window & { __googleMapsLoaded?: boolean }).__googleMapsLoaded
        ? resolve()
        : reject(new Error("Script loaded but API not ready"));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${URL}?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as Window & { __googleMapsLoaded?: boolean }).__googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
