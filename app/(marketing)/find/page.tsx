"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { CategoryDropdown } from "../_components/CategoryDropdown";
import { useServiceTypes } from "@/lib/hooks/useServiceTypes";

type WorkerCard = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  skills: string[];
  experienceYears: number;
  rating: number;
  totalReviews: number;
  pricePerService: number;
  address?: { city: string; state: string } | null;
  city?: string;
  state?: string;
  distance?: number;
};

export default function FindWorkerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategoryRaw = searchParams.get("skill") ?? "";
  const initialCategoryList = initialCategoryRaw
    ? initialCategoryRaw.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
  const initialLocation = searchParams.get("location") ?? "";
  const initialLat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
  const initialLng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;
  const initialDistance = Number(searchParams.get("distance")) || 25;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryList.length ? initialCategoryList : []
  );
  const [locationText, setLocationText] = useState(initialLocation);
  const [lat, setLat] = useState<number | undefined>(initialLat);
  const [lng, setLng] = useState<number | undefined>(initialLng);
  const [distance, setDistance] = useState(initialDistance);
  const [workers, setWorkers] = useState<WorkerCard[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const { services: apiServices } = useServiceTypes({ includeAll: true });
  const serviceOptions = apiServices.map((service) => service.name);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef(selectedCategories);
  const distanceRef = useRef(distance);

  useEffect(() => {
    categoryRef.current = selectedCategories;
    distanceRef.current = distance;
  }, [selectedCategories, distance]);

  const runSearch = (nextLat?: number, nextLng?: number) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const services = selectedCategories.filter((item) => item !== "All Services");
    if (typeof nextLat !== "number" || typeof nextLng !== "number") {
      const params = new URLSearchParams();
      if (services.length > 0) {
        params.set("skill", services.join(","));
      }
      params.set("random", "1");
      params.set("limit", "12");

      fetch(`/api/workers?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch workers");
          return res.json();
        })
        .then((data) => {
          setWorkers(data.data ?? []);
          setCount(data.count ?? 0);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setError(err.message);
        })
        .finally(() => setLoading(false));
      return () => controller.abort();
    }

    if (services.length === 0) {
      const params = new URLSearchParams();
      params.set("lat", String(nextLat));
      params.set("lng", String(nextLng));
      if (distance) params.set("distance", String(distance));
      fetch(`/api/workers?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch workers");
          return res.json();
        })
        .then((data) => {
          setWorkers(data.data ?? []);
          setCount(data.count ?? 0);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setError(err.message);
        })
        .finally(() => setLoading(false));
      return () => controller.abort();
    }

    const params = new URLSearchParams();
    params.set("service", services.join(","));
    params.set("lat", String(nextLat));
    params.set("lng", String(nextLng));
    if (distance) {
      const radiusKm = Math.max(1, Math.round(distance * 1.60934));
      params.set("radius", String(radiusKm));
    }

    fetch(`/api/search/workers?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch workers");
        return res.json();
      })
      .then((data) => {
        setWorkers(data.data ?? []);
        setCount(data.count ?? 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  };

  useEffect(() => {
    runSearch(lat, lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (
    nextCategories: string[],
    nextDistance = distance,
    nextLocationText = locationText,
    nextLat = lat,
    nextLng = lng
  ) => {
    const params = new URLSearchParams();
    const filtered = nextCategories.filter((item) => item !== "All Services");
    if (filtered.length) params.set("skill", filtered.join(","));
    if (nextLocationText) params.set("location", nextLocationText);
    if (typeof nextLat === "number") params.set("lat", String(nextLat));
    if (typeof nextLng === "number") params.set("lng", String(nextLng));
    if (nextDistance) params.set("distance", String(nextDistance));
    const qs = params.toString();
    router.replace(qs ? `/find?${qs}` : "/find");
  };

  useEffect(() => {
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
          const formatted = place?.formatted_address ?? locationInputRef.current?.value ?? locationText;
          setLocationText(formatted);
          setLat(latValue);
          setLng(lngValue);
          handleFilterChange(categoryRef.current, distanceRef.current, formatted, latValue, lngValue);
        });
      })
      .catch(() => {});

    return () => {
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, []);

  // Do not auto-resolve location on mount; only resolve on button click.

  const resolveLocation = async (value: string) => {
    if (!value) return;
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error("Unable to geocode location.");
      const data = await res.json();
      setLat(data.latitude);
      setLng(data.longitude);
      setLocationHint(`Lat: ${data.latitude.toFixed(5)}, Lng: ${data.longitude.toFixed(5)}`);
      handleFilterChange(selectedCategories, distance, value, data.latitude, data.longitude);
      return { lat: data.latitude, lng: data.longitude };
    } catch {
      setLocationHint("Unable to resolve address. Try a more specific location.");
    }
  };

  const resolveBrowserLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setError(null);
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nextLat = pos.coords.latitude;
          const nextLng = pos.coords.longitude;
          setLat(nextLat);
          setLng(nextLng);
          setLocationText("Current location");
          handleFilterChange(selectedCategories, distance, "Current location", nextLat, nextLng);
          resolve({ lat: nextLat, lng: nextLng });
        },
        async () => {
          try {
            const res = await fetch("/api/geoip");
            if (!res.ok) throw new Error("Geo IP location unavailable.");
            const data = await res.json();
            const label = [data.city, data.region, data.country].filter(Boolean).join(", ") || "Current location";
            setLat(data.latitude);
            setLng(data.longitude);
            setLocationText(label);
            handleFilterChange(selectedCategories, distance, label, data.latitude, data.longitude);
            resolve({ lat: data.latitude, lng: data.longitude });
          } catch {
            setError("Unable to access your location. Please enable location permissions.");
            resolve(null);
          }
        }
      );
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <nav className="w-full border-b border-neutral-border bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 sm:px-12 lg:px-[48px]">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-green" />
            <span className="text-[20px] font-bold text-black">LocalPros</span>
          </Link>
          <div className="hidden items-center gap-8 text-[14px] text-neutral-muted md:flex">
            <Link href="/find" className="text-black">Find Services</Link>
            <Link href="#">Explore Pros</Link>
            <Link href="/login">Log In</Link>
          </div>
          <Link
            href="/worker/register"
            className="rounded-lg bg-black px-4 py-2 text-[12px] font-semibold text-white"
          >
            Register as Worker
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-10 sm:px-12 lg:px-[48px]">
        <div>
          <h1 className="text-[24px] font-bold text-black sm:text-[28px]">Find Services Near You</h1>
          <p className="mt-2 text-[13px] text-neutral-muted">
            {count} professionals available {locationText ? `near ${locationText}` : "near you"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-[16px] border border-neutral-border bg-white p-5 shadow-sm">
            <div className="mt-6">
              <div className="text-[13px] font-semibold text-black">Distance</div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-muted">
                <span>5 mi</span>
                <span>200 mi</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                value={distance}
                onChange={(event) => {
                  const nextDistance = Number(event.target.value);
                  setDistance(nextDistance);
                  handleFilterChange(selectedCategories, nextDistance);
                }}
                className="mt-2 w-full accent-brand-green"
              />
              <div className="mt-1 text-[11px] text-neutral-muted">Within {distance} miles</div>
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 rounded-[16px] border border-neutral-border bg-white p-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="w-full lg:w-[220px]">
                <CategoryDropdown
                  options={serviceOptions}
                  values={selectedCategories}
                  onChange={(values) => {
                    const cleaned = values.includes("All Services") ? ["All Services"] : values;
                    setSelectedCategories(cleaned);
                    handleFilterChange(cleaned, distance);
                  }}
                  placeholder="Search services..."
                  buttonClassName="h-[44px] px-4 py-2 text-[13px]"
                />
              </div>

              <div className="flex flex-1 items-center gap-3 rounded-[12px] border border-neutral-border bg-white px-4 py-2">
                <span className="text-neutral-muted">📍</span>
                <input
                  ref={locationInputRef}
                  value={locationText}
                  onChange={(event) => setLocationText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  placeholder="Enter a location"
                  className="flex-1 text-[13px] text-black placeholder:text-neutral-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    void resolveBrowserLocation();
                  }}
                  className="text-[12px] font-medium text-brand-green whitespace-nowrap"
                >
                  Use my location
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof lat === "number" && typeof lng === "number") {
                    runSearch(lat, lng);
                    return;
                  }
                  if (locationText.trim()) {
                    void resolveLocation(locationText).then((coords) => {
                      if (coords) runSearch(coords.lat, coords.lng);
                    });
                    return;
                  }
                  runSearch();
                }}
                className="rounded-[12px] bg-brand-green px-5 py-3 text-[12px] font-semibold text-white lg:h-[44px]"
              >
                Update results
              </button>
            </div>
            {locationHint ? (
              <p className="text-[11px] text-neutral-muted">{locationHint}</p>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="text-[13px] text-neutral-muted">Loading workers...</div>
              ) : null}
              {error ? (
                <div className="text-[13px] text-red-500">{error}</div>
              ) : null}
              {!loading && !error && workers.length === 0 ? (
                <div className="text-[13px] text-neutral-muted">No workers found.</div>
              ) : null}
              {workers.map((pro) => (
                <article
                  key={pro.id}
                  className="overflow-hidden rounded-[16px] border border-neutral-border bg-white shadow-sm"
                >
                  <div className="relative h-[140px] w-full">
                    <div className="h-full w-full bg-[#f3f3f3]" />
                    <div className="absolute bottom-3 left-3 h-10 w-10 rounded-full border-2 border-white bg-white" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[14px] font-semibold text-black">{pro.name}</h3>
                        <p className="text-[11px] text-neutral-muted">
                          {pro.skills?.[0] ?? "Service Pro"} · {pro.experienceYears} yrs exp
                        </p>
                      </div>
                      <span className="text-[11px] text-brand-green">✔</span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-muted">
                      <span>⭐ {pro.rating} ({pro.totalReviews})</span>
                      <span>
                        📍 {pro.city ?? pro.address?.city ?? "Nearby"}, {pro.state ?? pro.address?.state ?? "—"}
                        {typeof pro.distance === "number" ? ` · ${pro.distance.toFixed(1)} mi` : ""}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-black">₹{pro.pricePerService}/hr</span>
                      <button className="rounded-[10px] bg-brand-mint px-3 py-2 text-[11px] font-semibold text-black">
                        View Profile
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
