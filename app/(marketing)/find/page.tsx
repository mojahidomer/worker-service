"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader } from "../_components/Loader";
import { SearchBar } from "../_components/SearchBar";
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

function FindWorkerPageContent() {
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

  // Autocomplete handled by shared SearchBar component.

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
            <SearchBar
              size="hero"
              fullWidth
              serviceOptions={serviceOptions}
              selectedServices={selectedCategories}
              onServicesChange={(values) => {
                const cleaned = values.includes("All Services") ? ["All Services"] : values;
                setSelectedCategories(cleaned);
                handleFilterChange(cleaned, distance);
              }}
              locationValue={locationText}
              onLocationChange={(value) => {
                setLocationText(value);
                setLat(undefined);
                setLng(undefined);
                setLocationHint(null);
              }}
              onPlaceSelected={(formatted, nextLat, nextLng) => {
                setLocationText(formatted);
                setLat(nextLat);
                setLng(nextLng);
                handleFilterChange(categoryRef.current, distanceRef.current, formatted, nextLat, nextLng);
              }}
              onUseMyLocation={() => {
                void resolveBrowserLocation();
              }}
              onSearch={() => {
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
              forceIcon
              placeholderService="Search services..."
              placeholderLocation="Enter a location"
            />
            {locationHint ? (
              <p className="text-[11px] text-neutral-muted">{locationHint}</p>
            ) : null}

            {loading ? (
              <Loader label="Loading workers..." />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {error ? (
                  <div className="text-[13px] text-red-500">{error}</div>
                ) : null}
                {!error && workers.length === 0 ? (
                  <div className="text-[13px] text-neutral-muted">No workers found.</div>
                ) : null}
                {workers.map((pro) => (
                <article
                  key={pro.id}
                  className="group overflow-hidden rounded-[16px] border border-neutral-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-[150px] w-full">
                    <div className="h-full w-full bg-[#f3f3f3]" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-white" />
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-black">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[14px] font-semibold text-black">{pro.name}</h3>
                        <p className="text-[11px] text-neutral-muted">
                          {pro.skills?.[0] ?? "Service Pro"} · {pro.experienceYears} yrs exp
                        </p>
                      </div>
                      <button className="rounded-full border border-neutral-border px-2 py-1 text-[10px] text-neutral-muted hover:border-brand-green hover:text-brand-green">
                        Save
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-muted">
                      <span>⭐ {pro.rating} ({pro.totalReviews})</span>
                      <span>
                        📍 {pro.city ?? pro.address?.city ?? "Nearby"}, {pro.state ?? pro.address?.state ?? "—"}
                        {typeof pro.distance === "number" ? ` · ${pro.distance.toFixed(1)} mi` : ""}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(pro.skills ?? []).slice(0, 3).map((skill) => (
                        <span
                          key={`${pro.id}-${skill}`}
                          className="rounded-full border border-[#d7f2e3] bg-[#dbf7e5] px-2 py-1 text-[10px] font-medium text-black"
                        >
                          {skill}
                        </span>
                      ))}
                      {(pro.skills?.length ?? 0) > 3 ? (
                        <span className="rounded-full border border-neutral-border bg-white px-2 py-1 text-[10px] text-neutral-muted">
                          +{(pro.skills?.length ?? 0) - 3} more
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-semibold text-black">₹{pro.pricePerService}/hr</span>
                        <span className="text-[11px] text-neutral-muted">📞 {pro.phone}</span>
                      </div>
                      <Link
                        href={`/worker/${pro.id}`}
                        className="rounded-[10px] bg-brand-green px-3 py-2 text-[11px] font-semibold text-white transition-all group-hover:translate-x-0.5"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function FindWorkerPage() {
  return (
    <Suspense fallback={<Loader label="Loading..." />}>
      <FindWorkerPageContent />
    </Suspense>
  );
}
